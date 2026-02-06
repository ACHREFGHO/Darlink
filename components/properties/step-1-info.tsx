'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyFormData } from '@/components/properties/types'
import { useState } from 'react'

interface Step1Props {
    data: PropertyFormData
    updateData: (data: Partial<PropertyFormData>) => void
    onNext: (data?: Partial<PropertyFormData>) => void
    mode?: 'create' | 'edit'
    isSaving?: boolean
}

export function Step1Info({ data, updateData, onNext, mode = 'create', isSaving = false }: Step1Props) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: data.title,
            description: data.description,
            type: data.type,
            address: data.address,
            city: data.city,
            governorate: data.governorate,
            main_image_url: data.main_image_url
        }
    })

    const [selectedImages, setSelectedImages] = useState<{ file: File, caption: string }[]>(data.images || [])
    const [existingImagesObj, setExistingImagesObj] = useState(data.existing_images || [])
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>(data.deleted_image_ids || [])

    const [previews, setPreviews] = useState<string[]>(() => {
        if (data.images && data.images.length > 0) {
            return data.images.map(img => URL.createObjectURL(img.file))
        }
        return []
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const newImageObjects = files.map(file => ({
                file,
                caption: file.name.split('.')[0].replace(/[-_]/g, ' ') // Auto-generate caption from filename
            }))
            setSelectedImages(prev => [...prev, ...newImageObjects])

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const updateCaption = (index: number, caption: string) => {
        setSelectedImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img))
    }

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (id: string) => {
        setExistingImagesObj(prev => prev.filter(img => img.id !== id))
        setDeletedImageIds(prev => [...prev, id])
    }

    const onSubmit = (formData: any) => {
        const latestData = {
            ...formData,
            images: selectedImages,
            deleted_image_ids: deletedImageIds,
            existing_images: existingImagesObj
        }
        updateData(latestData)
        onNext(latestData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0B3D6F]">Property Details</h2>
                    <p className="text-sm text-muted-foreground">Tell us about your property.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="title">Property Title</Label>
                        <Input id="title" {...register('title', { required: 'Title is required' })} placeholder="e.g. Luxurious Villa in Hammamet" />
                        {errors.title && <span className="text-sm text-red-500">{String(errors.title.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Property Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('type')}
                        >
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Guesthouse">Guesthouse</option>
                        </select>
                    </div>

                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description', { required: 'Description is required' })}
                        className="h-32"
                        placeholder="Describe your property..."
                    />
                    {errors.description && <span className="text-sm text-red-500">{String(errors.description.message)}</span>}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <Label htmlFor="images">Property Photos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0B3D6F] transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            </div>
                            <div className="text-sm font-medium">Click to upload or drag and drop</div>
                            <div className="text-xs text-muted-foreground">High-quality photos help your property stand out</div>
                        </div>
                    </div>

                    {/* Previews */}
                    {(previews.length > 0 || existingImagesObj.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* Existing Images */}
                            {existingImagesObj.map((img) => (
                                <div key={img.id} className="relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm group transition-all hover:shadow-md">
                                    <div className="aspect-video relative">
                                        <img src={img.image_url} alt="Existing photo" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-slate-900/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Saved</div>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <p className="text-xs font-bold text-slate-400 truncate">{img.caption || 'No specific name given'}</p>
                                    </div>
                                </div>
                            ))}

                            {/* New Previews with Caption Input */}
                            {selectedImages.map((imgObj, index) => (
                                <div key={index} className="relative rounded-2xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm group transition-all hover:border-[#F17720]/30 hover:shadow-md">
                                    <div className="aspect-video relative bg-slate-50">
                                        <img src={previews[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="p-3 bg-white space-y-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="h-8 text-xs font-bold border-slate-100 bg-slate-50 focus:bg-white rounded-lg"
                                                placeholder="Give this photo a name (e.g. Master Bedroom)"
                                                value={imgObj.caption}
                                                onChange={(e) => updateCaption(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="bg-[#0B3D6F] text-white hover:bg-[#092d52] px-8">
                    {isSaving ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Next Step')}
                </Button>
            </div>
        </form>
    )
}
