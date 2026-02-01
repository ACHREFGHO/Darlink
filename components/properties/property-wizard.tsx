'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { Step1Info } from '@/components/properties/step-1-info'
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
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            // 1. Upload Images
            let mainImageUrl = formData.main_image_url
            const uploadedImageUrls: string[] = []

            if (formData.images && formData.images.length > 0) {
                for (const file of formData.images) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                    const { error: uploadError } = await supabase.storage
                        .from('property-images')
                        .upload(fileName, file)

                    if (uploadError) {
                        console.error('Error uploading image:', uploadError)
                        continue
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('property-images')
                        .getPublicUrl(fileName)

                    uploadedImageUrls.push(publicUrl)
                }

                if (uploadedImageUrls.length > 0) {
                    mainImageUrl = uploadedImageUrls[0] // Set first image as main
                }
            }

            // 2. Create Property
            const { data: property, error: propError } = await supabase
                .from('properties')
                .insert({
                    owner_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    address: formData.address,
                    city: formData.city,
                    governorate: formData.governorate,
                    main_image_url: mainImageUrl,
                    status: 'Pending'
                })
                .select()
                .single()

            if (propError) throw propError

            // 2. Create Rooms
            if (formData.rooms.length > 0) {
                const roomsToInsert = formData.rooms.map(room => ({
                    property_id: property.id,
                    ...room
                }))
                const { error: roomError } = await supabase.from('rooms').insert(roomsToInsert)
                if (roomError) throw roomError
            }

            // 3. Create Specs
            if (formData.specs.length > 0) {
                const specsToInsert = formData.specs.map(category => ({
                    property_id: property.id,
                    category
                }))
                const { error: specError } = await supabase.from('property_specs').insert(specsToInsert)
                if (specError) throw specError
            }

            // 4. Create Property Images
            if (uploadedImageUrls.length > 0) {
                const imagesToInsert = uploadedImageUrls.map((url, index) => ({
                    property_id: property.id,
                    image_url: url,
                    display_order: index
                }))
                const { error: imgError } = await supabase.from('property_images').insert(imagesToInsert)
                if (imgError) throw imgError
            }

            // Success
            router.push('/owner/dashboard')

        } catch (error: any) {
            console.error('Error creating property:', error)
            toast.error(`Error: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between relative px-4">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex flex-col items-center gap-2 bg-gray-50 px-2`}>
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                                ${step >= s ? 'bg-[#0B3D6F] text-white' : 'bg-gray-200 text-gray-500'}
                            `}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                                {s === 1 && 'Basic Info'}
                                {s === 2 && 'Rooms & Rates'}
                                {s === 3 && 'Amenities'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="p-6">
                {step === 1 && <Step1Info data={formData} updateData={updateData} onNext={handleNext} />}
                {step === 2 && <Step2Rooms data={formData} updateData={updateData} onBack={handleBack} onNext={handleNext} />}
                {step === 3 && <Step3Specs data={formData} updateData={updateData} onBack={handleBack} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
            </Card>
        </div>
    )
}
