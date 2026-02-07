'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { Step1Info } from '@/components/properties/step-1-info'
import { Step2Location } from '@/components/properties/step-2-location'
import { Step2Rooms } from '@/components/properties/step-2-rooms'
import { Step3Specs } from '@/components/properties/step-3-specs'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner' // We might need to install sonner or use useToast from shadcn

import { PropertyFormData } from '@/components/properties/types'

const INITIAL_DATA: PropertyFormData = {
    title: '',
    description: '',
    type: 'House',
    address: '',
    city: '',
    governorate: '',
    main_image_url: '',
    images: [],
    rooms: [], // Note: Initial state for rooms now includes room_count via Step2Rooms
    specs: []
}

import { useUser } from '@/components/providers/user-provider'

export function PropertyWizard() {
    const { profile } = useUser()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<PropertyFormData>(INITIAL_DATA)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const updateData = (data: Partial<PropertyFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleNext = (data?: Partial<PropertyFormData>) => {
        if (data) updateData(data)
        setStep(prev => prev + 1)
    }
    const handleBack = () => setStep(prev => prev - 1)

    const handleSubmit = async (finalData?: Partial<PropertyFormData>) => {
        if (isSubmitting) return
        setIsSubmitting(true)

        // Merge latest data from final step to avoid stale state
        const currentData = { ...formData, ...finalData }

        const toastId = toast.loading("Initializing property creation...")

        try {
            // 1. Authenticate User (Fast Path)
            toast.loading("Authenticating user...", { id: toastId })
            const { data: { session } } = await supabase.auth.getSession()
            let user = session?.user

            if (!user) {
                const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser()
                if (userError) throw userError
                if (freshUser) user = freshUser
            }

            if (!user) {
                throw new Error("You must be logged in to list a property. Please log in and try again.")
            }

            // 2. Upload Images
            let mainImageUrl = currentData.main_image_url
            const uploadedImages: { url: string, caption: string }[] = []

            if (currentData.images && currentData.images.length > 0) {
                const totalImages = currentData.images.length
                for (let i = 0; i < totalImages; i++) {
                    const { file, caption } = currentData.images[i]
                    toast.loading(`Uploading image ${i + 1}/${totalImages}: ${caption}...`, { id: toastId })

                    const fileExt = file.name.split('.').pop()
                    const safeCaption = caption.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    const fileName = `${user.id}/${Date.now()}-${safeCaption}.${fileExt}`

                    const { error: uploadError } = await supabase.storage
                        .from('property-images')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        })

                    if (uploadError) {
                        console.error(`Upload error for ${file.name}:`, uploadError)
                        continue
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('property-images')
                        .getPublicUrl(fileName)

                    uploadedImages.push({ url: publicUrl, caption })
                }

                if (uploadedImages.length > 0 && !mainImageUrl) {
                    mainImageUrl = uploadedImages[0].url
                }
            }

            // 3. Create Property Record
            toast.loading("Registering property...", { id: toastId })
            const propertyData: any = {
                owner_id: user.id,
                title: currentData.title,
                description: currentData.description,
                type: currentData.type,
                address: currentData.address,
                city: currentData.city,
                governorate: currentData.governorate,
                status: 'Pending'
            }

            if (mainImageUrl) propertyData.main_image_url = mainImageUrl
            if (currentData.latitude) propertyData.latitude = currentData.latitude
            if (currentData.longitude) propertyData.longitude = currentData.longitude

            const { data: property, error: propError } = await supabase
                .from('properties')
                .insert(propertyData)
                .select()
                .single()

            if (propError) {
                console.error('Property creation error:', propError)
                if (propError.message?.toLowerCase().includes('latitude')) {
                    throw new Error('Technical error: Database location columns missing. Contact support.')
                }
                throw new Error(`Failed to create property: ${propError.message}`)
            }

            if (!property) throw new Error("Property was created but could not be retrieved.")

            // 4. Batch Operations (Rooms & Specs & Images)
            // Rooms
            if (currentData.rooms.length > 0) {
                console.log('Inserting rooms:', currentData.rooms)
                toast.loading("Saving room details...", { id: toastId })
                const roomsToInsert = currentData.rooms.map(room => ({
                    property_id: property.id,
                    name: room.name,
                    price_per_night: room.price_per_night,
                    beds: room.beds,
                    max_guests: room.max_guests,
                    units_count: room.units_count,
                    room_count: room.room_count
                }))

                const { data: roomData, error: roomError } = await supabase.from('rooms').insert(roomsToInsert).select()

                if (roomError) {
                    console.error('Room Insertion Error:', roomError)
                    throw new Error(`Room saving failed: ${roomError.message}`)
                }
                console.log('Rooms inserted successfully:', roomData)
            }

            // Specs
            if (currentData.specs.length > 0) {
                toast.loading("Saving categories...", { id: toastId })
                const specsToInsert = currentData.specs.map(category => ({
                    property_id: property.id,
                    category
                }))
                const { error: specError } = await supabase.from('property_specs').insert(specsToInsert)
                if (specError) throw new Error(`Specs saving failed: ${specError.message}`)
            }

            // Amenities (Non-fatal)
            if (currentData.amenities && currentData.amenities.length > 0) {
                toast.loading("Adding amenities...", { id: toastId })
                const amenitiesToInsert = currentData.amenities.map(amenity => ({
                    property_id: property.id,
                    amenity
                }))

                try {
                    const { error: amError } = await supabase.from('property_amenities').insert(amenitiesToInsert)
                    if (amError) {
                        console.error('Amenity Insertion Error Details:', amError)

                        if (amError.code === '42P01') {
                            console.warn('The table "property_amenities" does not exist. Please run the add_amenities.sql migration in Supabase.')
                        }
                    }
                } catch (err) {
                    console.error('Unexpected error during amenity insertion:', err)
                }
            }

            // Image Gallery Links
            if (uploadedImages.length > 0) {
                toast.loading("Finalizing gallery...", { id: toastId })
                const imagesToInsert = uploadedImages.map((img, index) => ({
                    property_id: property.id,
                    image_url: img.url,
                    caption: img.caption,
                    display_order: index
                }))
                const { error: imgError } = await supabase.from('property_images').insert(imagesToInsert)
                if (imgError) throw new Error(`Gallery creation failed: ${imgError.message}`)
            }

            // 6. Role Upgrade (Ensures they can access the dashboard)
            if (profile?.role === 'client') {
                toast.loading("Upgrading your account to Owner...", { id: toastId })
                const { error: roleError } = await supabase
                    .from('profiles')
                    .update({ role: 'house_owner' })
                    .eq('id', user.id)

                if (roleError) console.error('Failed to upgrade role:', roleError)
            }

            toast.success("Property listed and sent for review!", { id: toastId })
            router.refresh()
            router.push('/owner/dashboard')

        } catch (error: any) {
            console.error('Full Submission Error:', error)
            toast.error(error.message || "Something went wrong during submission", { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between relative px-4">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex flex-col items-center gap-2 bg-gray-50 px-2`}>
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                                ${step >= s ? 'bg-[#0B3D6F] text-white' : 'bg-gray-200 text-gray-500'}
                            `}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                                {s === 1 && 'Basic Info'}
                                {s === 2 && 'Location'}
                                {s === 3 && (formData.type === 'House' ? 'Rooms' : 'Houses')}
                                {s === 4 && 'Amenities'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="p-6">
                {step === 1 && <Step1Info data={formData} updateData={updateData} onNext={handleNext} />}
                {step === 2 && <Step2Location data={formData} updateData={updateData} onBack={handleBack} onNext={handleNext} />}
                {step === 3 && <Step2Rooms data={formData} updateData={updateData} onBack={handleBack} onNext={handleNext} />}
                {step === 4 && <Step3Specs data={formData} updateData={updateData} onBack={handleBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
            </Card>
        </div>
    )
}
