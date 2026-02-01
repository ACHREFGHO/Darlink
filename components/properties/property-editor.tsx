'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyFormData } from '@/components/properties/types'
import { Step1Info } from '@/components/properties/step-1-info'
import { Step2Rooms } from '@/components/properties/step-2-rooms'
import { Step3Specs } from '@/components/properties/step-3-specs'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PropertyEditorProps {
    initialData: any
    propertyId: string
}

export function PropertyEditor({ initialData, propertyId }: PropertyEditorProps) {
    const [activeTab, setActiveTab] = useState('details')
    const [formData, setFormData] = useState<PropertyFormData>(initialData)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const updateData = (data: Partial<PropertyFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleSave = async (overrideData?: Partial<PropertyFormData>) => {
        setIsSaving(true)
        // Use the latest data being passed from the step, or fallback to current state
        const currentData = { ...formData, ...overrideData }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Upload new images if any
            const uploadedImageUrls: string[] = []
            if (currentData.images && currentData.images.length > 0) {
                for (const file of currentData.images) {
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
            }

            // 2. Logic to determine main_image_url
            let finalMainImageUrl = currentData.main_image_url

            // Check if current main image is still in the "existing images" list AND not in the deleted list
            const isMainImageAlive = currentData.existing_images?.some(img =>
                img.image_url === finalMainImageUrl &&
                !currentData.deleted_image_ids?.includes(img.id)
            )

            if (!isMainImageAlive) {
                // If main image was deleted or not found, try to find the first available existing image that is NOT deleted
                const firstAliveImage = currentData.existing_images?.find(img => !currentData.deleted_image_ids?.includes(img.id))

                if (firstAliveImage) {
                    finalMainImageUrl = firstAliveImage.image_url
                }
                // If no existing images left, pick the first new upload
                else if (uploadedImageUrls.length > 0) {
                    finalMainImageUrl = uploadedImageUrls[0]
                }
                // Else it remains whatever it was (likely broken or empty)
                else {
                    finalMainImageUrl = ''
                }
            } else if (uploadedImageUrls.length > 0 && (!currentData.existing_images || currentData.existing_images.length === 0)) {
                // If we have new images and no existing images
            }

            // Special case: if we want to force prioritize new images if the property had NO images before?
            if (!finalMainImageUrl && uploadedImageUrls.length > 0) {
                finalMainImageUrl = uploadedImageUrls[0]
            }

            // Update Property Details
            const { error: propError } = await supabase
                .from('properties')
                .update({
                    title: currentData.title,
                    description: currentData.description,
                    type: currentData.type,
                    address: currentData.address,
                    city: currentData.city,
                    governorate: currentData.governorate,
                    main_image_url: finalMainImageUrl
                })
                .eq('id', propertyId)

            if (propError) throw propError

            // 3. Handle Deleted Images
            if (currentData.deleted_image_ids && currentData.deleted_image_ids.length > 0) {
                await supabase
                    .from('property_images')
                    .delete()
                    .in('id', currentData.deleted_image_ids)
            }

            // 4. Insert New Images
            if (uploadedImageUrls.length > 0) {
                // Get current max order
                const { data: existingImgs } = await supabase
                    .from('property_images')
                    .select('display_order')
                    .eq('property_id', propertyId)
                    .order('display_order', { ascending: false })
                    .limit(1)

                let startOrder = (existingImgs?.[0]?.display_order || 0) + 1

                const imagesToInsert = uploadedImageUrls.map((url, index) => ({
                    property_id: propertyId,
                    image_url: url,
                    display_order: startOrder + index
                }))

                const { error: imgError } = await supabase.from('property_images').insert(imagesToInsert)
                if (imgError) throw imgError
            }

            // 5. Update Rooms
            await supabase.from('rooms').delete().eq('property_id', propertyId)

            if (currentData.rooms.length > 0) {
                const roomsToInsert = currentData.rooms.map(room => ({
                    property_id: propertyId,
                    ...room
                }))
                await supabase.from('rooms').insert(roomsToInsert)
            }

            // 6. Update Specs
            await supabase.from('property_specs').delete().eq('property_id', propertyId)

            if (currentData.specs.length > 0) {
                const specsToInsert = currentData.specs.map(category => ({
                    property_id: propertyId,
                    category
                }))
                await supabase.from('property_specs').insert(specsToInsert)
            }

            toast.success('Property updated successfully')

            // Wait a bit to ensure database triggers/indexes catch up if any, though likely not needed for this.
            // But we must clear the "new images" from the form state so they don't get uploaded again if the user saves again immediately without leaving.

            if (uploadedImageUrls.length > 0) {
                // Clear the File objects from state, as they are now saved
                updateData({ images: [] })
                // We rely on router.refresh() to reload the page and fetch the new "existing_images"
            }

            router.refresh()

        } catch (error: any) {
            console.error('Error updating property:', error)
            toast.error(`Error: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="p-6">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="details">Details & Photos</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms & Rates</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Step1Info
                        data={formData}
                        updateData={updateData}
                        onNext={handleSave}
                        // @ts-ignore - we haven't added these props yet
                        mode="edit"
                        isSaving={isSaving}
                    />
                </TabsContent>

                <TabsContent value="rooms">
                    <Step2Rooms
                        data={formData}
                        updateData={updateData}
                        onNext={handleSave}
                        onBack={() => setActiveTab('details')}
                        // @ts-ignore
                        mode="edit"
                        isSaving={isSaving}
                    />
                </TabsContent>

                <TabsContent value="amenities">
                    <Step3Specs
                        data={formData}
                        updateData={updateData}
                        onSubmit={handleSave}
                        onBack={() => setActiveTab('rooms')}
                        // @ts-ignore
                        mode="edit"
                        isSubmitting={isSaving}
                    />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
