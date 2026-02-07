'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyFormData } from '@/components/properties/types'
import { Step1Info } from '@/components/properties/step-1-info'
import { Step2Location } from '@/components/properties/step-2-location'
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
        console.log("Saving property changes initiated...", { propertyId, overrideData })
        const toastId = toast.loading("Saving changes to property...")

        // CRITICAL: Merge the very latest override data with existing form state
        const currentData = { ...formData, ...overrideData }

        try {
            // Add a safety timeout for the entire operation (30 seconds)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('Authentication failed. Please refresh and log in again.')

            // 1. Upload new images if any
            const uploadedImages: { url: string, caption: string }[] = []
            if (currentData.images && currentData.images.length > 0) {
                const totalNew = currentData.images.length
                for (let i = 0; i < totalNew; i++) {
                    const { file, caption } = currentData.images[i]
                    toast.loading(`Uploading image ${i + 1} of ${totalNew}...`, { id: toastId })

                    const fileExt = file.name.split('.').pop()
                    const safeCaption = caption.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    const fileName = `${user.id}/${Date.now()}-${safeCaption}-${Math.random().toString(36).substring(7)}.${fileExt}`

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

                    uploadedImages.push({ url: publicUrl, caption })
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
                const firstAliveImage = currentData.existing_images?.find(img => !currentData.deleted_image_ids?.includes(img.id))
                if (firstAliveImage) {
                    finalMainImageUrl = firstAliveImage.image_url
                } else if (uploadedImages.length > 0) {
                    finalMainImageUrl = uploadedImages[0].url
                } else {
                    finalMainImageUrl = ''
                }
            }

            // Update Property Details
            console.log("Updating properties table...")
            toast.loading("Updating property information...", { id: toastId })
            const { error: propError } = await supabase
                .from('properties')
                .update({
                    title: currentData.title,
                    description: currentData.description,
                    type: currentData.type,
                    address: currentData.address,
                    city: currentData.city,
                    governorate: currentData.governorate,
                    latitude: currentData.latitude,
                    longitude: currentData.longitude,
                    main_image_url: finalMainImageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', propertyId)

            if (propError) {
                console.error("Property update error:", propError)
                throw new Error(`Property update failed: ${propError.message}`)
            }

            // 3. Handle Deleted Images
            if (currentData.deleted_image_ids && currentData.deleted_image_ids.length > 0) {
                console.log("Deleting images:", currentData.deleted_image_ids)
                toast.loading("Cleaning up removed photos...", { id: toastId })
                await supabase
                    .from('property_images')
                    .delete()
                    .in('id', currentData.deleted_image_ids)
            }

            // 4. Insert New Images
            if (uploadedImages.length > 0) {
                console.log("Inserting new image records...")
                toast.loading("Updating photo gallery...", { id: toastId })
                const { data: existingImgs } = await supabase
                    .from('property_images')
                    .select('display_order')
                    .eq('property_id', propertyId)
                    .order('display_order', { ascending: false })
                    .limit(1)

                let startOrder = (existingImgs?.[0]?.display_order || 0) + 1

                const imagesToInsert = uploadedImages.map((img, index) => ({
                    property_id: propertyId,
                    image_url: img.url,
                    caption: img.caption,
                    display_order: startOrder + index
                }))

                const { error: imgError } = await supabase.from('property_images').insert(imagesToInsert)
                if (imgError) throw imgError
            }

            // 5. Update Rooms
            if (currentData.rooms && currentData.rooms.length > 0) {
                console.log("Refreshing rooms data...")
                toast.loading("Updating rooms and pricing...", { id: toastId })
                // IMPORTANT: Clear old rooms
                const { error: deleteRoomsError } = await supabase.from('rooms').delete().eq('property_id', propertyId)
                if (deleteRoomsError) throw deleteRoomsError

                // Re-insert current rooms (stripping DB internal fields if they exist)
                const roomsToInsert = currentData.rooms.map(room => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, property_id, created_at, ...roomData } = room as any
                    return {
                        property_id: propertyId,
                        ...roomData
                    }
                })
                const { error: insertRoomsError } = await supabase.from('rooms').insert(roomsToInsert)
                if (insertRoomsError) throw insertRoomsError
            }

            // 6. Update Specs
            if (currentData.specs) {
                console.log("Refreshing category tags...")
                toast.loading("Updating categories...", { id: toastId })
                await supabase.from('property_specs').delete().eq('property_id', propertyId)

                if (currentData.specs.length > 0) {
                    const specsToInsert = currentData.specs.map(category => ({
                        property_id: propertyId,
                        category
                    }))
                    const { error: insertSpecsError } = await supabase.from('property_specs').insert(specsToInsert)
                    if (insertSpecsError) throw insertSpecsError
                }
            }

            // 7. Update Amenities
            if (currentData.amenities) {
                console.log("Refreshing amenities...")
                toast.loading("Updating amenities...", { id: toastId })
                await supabase.from('property_amenities').delete().eq('property_id', propertyId)

                if (currentData.amenities.length > 0) {
                    const amenitiesToInsert = currentData.amenities.map(amenity => ({
                        property_id: propertyId,
                        amenity
                    }))
                    const { error: insertAmError } = await supabase.from('property_amenities').insert(amenitiesToInsert)
                    if (insertAmError) throw insertAmError
                }
            }

            clearTimeout(timeoutId)
            console.log("Save successful!")
            toast.success('Property updated successfully', { id: toastId })

            if (uploadedImages.length > 0) {
                updateData({ images: [] })
            }

            router.refresh()

        } catch (error: any) {
            console.error('Error updating property:', error)
            toast.error(`Error: ${error.message}`, { id: toastId })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="p-6">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="details">Basic Info</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="rooms">{formData.type === 'House' ? 'Rooms' : 'Houses'} & Rates</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Step1Info
                        data={formData}
                        updateData={updateData}
                        onNext={(data) => {
                            const combined = { ...formData, ...data }
                            setFormData(combined)
                            handleSave(combined)
                        }}
                        mode="edit"
                        isSaving={isSaving}
                    />
                </TabsContent>

                <TabsContent value="location">
                    <Step2Location
                        data={formData}
                        updateData={updateData}
                        onBack={() => setActiveTab('details')}
                        onNext={(data) => {
                            const combined = { ...formData, ...data }
                            setFormData(combined)
                            handleSave(combined)
                        }}
                        mode="edit"
                    />
                </TabsContent>

                <TabsContent value="rooms">
                    <Step2Rooms
                        data={formData}
                        updateData={updateData}
                        onNext={(data) => {
                            const combined = { ...formData, ...data }
                            setFormData(combined)
                            handleSave(combined)
                        }}
                        onBack={() => setActiveTab('location')}
                        mode="edit"
                        isSaving={isSaving}
                    />
                </TabsContent>

                <TabsContent value="amenities">
                    <Step3Specs
                        data={formData}
                        updateData={updateData}
                        onSubmit={(data) => {
                            const combined = { ...formData, ...data }
                            setFormData(combined)
                            handleSave(combined)
                        }}
                        onBack={() => setActiveTab('rooms')}
                        mode="edit"
                        isSubmitting={isSaving}
                    />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
