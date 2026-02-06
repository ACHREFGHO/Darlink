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
    rooms: [],
    specs: []
}

export function PropertyWizard() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<PropertyFormData>(INITIAL_DATA)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const updateData = (data: Partial<PropertyFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const toastId = toast.loading("Starting property creation...")

        try {
            // Safety timeout for the entire operation (5 minutes)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Operation timed out. Your connection might be slow or images too large.')), 300000)
            })

            const submitPromise = (async () => {
                toast.loading("Authenticating user...", { id: toastId })
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (!user || userError) {
                    console.error('Authentication error:', userError)
                    throw new Error(userError?.message || 'Not authenticated. Please log in again.')
                }

                // 1. Upload Images
                let mainImageUrl = formData.main_image_url
                const uploadedImages: { url: string, caption: string }[] = []

                if (formData.images && formData.images.length > 0) {
                    const totalImages = formData.images.length
                    for (let i = 0; i < totalImages; i++) {
                        const { file, caption } = formData.images[i]
                        toast.loading(`Uploading image ${i + 1} of ${totalImages}: ${caption}...`, { id: toastId })

                        const fileExt = file.name.split('.').pop()
                        // Use caption in filename for SEO purposes
                        const safeCaption = caption.toLowerCase().replace(/[^a-z0-9]/g, '-')
                        const fileName = `${user.id}/${Date.now()}-${safeCaption}.${fileExt}`

                        const { error: uploadError } = await supabase.storage
                            .from('property-images')
                            .upload(fileName, file)

                        if (uploadError) {
                            console.error(`Error uploading image ${i + 1}:`, uploadError)
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

                // 2. Create Property
                toast.loading("Creating property record...", { id: toastId })
                const propertyData: any = {
                    owner_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    address: formData.address,
                    city: formData.city,
                    governorate: formData.governorate,
                    status: 'Pending'
                }

                if (mainImageUrl) propertyData.main_image_url = mainImageUrl
                if (formData.latitude) propertyData.latitude = formData.latitude
                if (formData.longitude) propertyData.longitude = formData.longitude

                const { data: property, error: propError } = await supabase
                    .from('properties')
                    .insert(propertyData)
                    .select()
                    .single()

                if (propError) {
                    console.error('Error creating property:', propError)
                    const msg = propError.message?.toLowerCase() || ""
                    if (msg.includes('column "latitude"')) {
                        throw new Error('Database schema error: Missing location columns. Contact support.')
                    }
                    throw propError
                }

                // 3. Create Rooms
                if (formData.rooms.length > 0) {
                    toast.loading("Adding room details...", { id: toastId })
                    const roomsToInsert = formData.rooms.map(room => ({
                        property_id: property.id,
                        name: room.name,
                        price_per_night: room.price_per_night,
                        beds: room.beds,
                        max_guests: room.max_guests,
                        units_count: room.units_count
                    }))
                    const { error: roomError } = await supabase.from('rooms').insert(roomsToInsert)
                    if (roomError) {
                        console.error('Error inserting rooms:', roomError)
                        throw roomError
                    }
                }

                // 4. Create Specs
                if (formData.specs.length > 0) {
                    toast.loading("Applying categories...", { id: toastId })
                    const specsToInsert = formData.specs.map(category => ({
                        property_id: property.id,
                        category
                    }))
                    const { error: specError } = await supabase.from('property_specs').insert(specsToInsert)
                    if (specError) {
                        console.error('Error inserting specs:', specError)
                        throw specError
                    }
                }

                // 5. Create Property Images
                if (uploadedImages.length > 0) {
                    toast.loading("Finalizing gallery...", { id: toastId })
                    const imagesToInsert = uploadedImages.map((img, index) => ({
                        property_id: property.id,
                        image_url: img.url,
                        caption: img.caption,
                        display_order: index
                    }))
                    const { error: imgError } = await supabase.from('property_images').insert(imagesToInsert)
                    if (imgError) {
                        console.error('Error inserting property images:', imgError)
                        throw imgError
                    }
                }

                return true
            })()

            await Promise.race([submitPromise, timeoutPromise])

            toast.success("Listing published successfully!", { id: toastId })
            router.push('/owner/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error('Submission Error:', error)
            toast.error(error.message || "An unexpected error occurred", { id: toastId })
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
                                {s === 3 && 'Rooms'}
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
