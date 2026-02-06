'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PropertyFormData } from '@/components/properties/types'
import { MapPicker } from '@/components/ui/map-picker'
import { useState } from 'react'

interface Step2LocationProps {
    data: PropertyFormData
    updateData: (data: Partial<PropertyFormData>) => void
    onBack: () => void
    onNext: (data?: Partial<PropertyFormData>) => void
}

export function Step2Location({ data, updateData, onBack, onNext }: Step2LocationProps) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            address: data.address,
            city: data.city,
            governorate: data.governorate,
            latitude: data.latitude,
            longitude: data.longitude
        }
    })

    const [location, setLocation] = useState<{ lat?: number; lng?: number }>({
        lat: data.latitude,
        lng: data.longitude
    })

    const [isGeocoding, setIsGeocoding] = useState(false)

    const handleLocationSelect = async (lat: number, lng: number) => {
        setLocation({ lat, lng })
        setValue('latitude', lat)
        setValue('longitude', lng)

        setIsGeocoding(true)
        try {
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
            if (!token) return

            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,place,region&limit=1`
            )
            const data = await response.json()

            if (data.features && data.features.length > 0) {
                const feature = data.features[0]
                const context = feature.context || []

                // Mapbox context usually contains city, region (governorate in Tunisia)
                // feature.text is often the most specific part (address or city)

                let city = ''
                let governorate = ''
                let address = feature.place_name || ''

                // Extract from context
                const place = context.find((c: any) => c.id.startsWith('place'))
                const region = context.find((c: any) => c.id.startsWith('region'))

                if (place) city = place.text
                if (region) governorate = region.text

                // If feature itself is a place, use it as city
                if (feature.place_type.includes('place')) city = feature.text

                if (city) setValue('city', city)
                if (governorate) setValue('governorate', governorate)
                if (address && !watch('address')) setValue('address', address)
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error)
        } finally {
            setIsGeocoding(false)
        }
    }

    const onSubmit = (formData: any) => {
        const latestData = {
            ...formData,
            latitude: location.lat,
            longitude: location.lng
        }
        updateData(latestData)
        onNext(latestData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0B3D6F]">Location</h2>
                    <p className="text-sm text-muted-foreground">Pinpoint your property's exact location.</p>
                </div>

                <div className="space-y-6">
                    {/* Map Picker */}
                    <div className="space-y-2">
                        <Label>Pin Location on Map</Label>
                        <div className="border rounded-xl overflow-hidden shadow-sm">
                            <MapPicker
                                latitude={location.lat}
                                longitude={location.lng}
                                onLocationSelect={handleLocationSelect}
                                height="400px"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Click on the map to set the precise location.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="governorate" className="flex items-center gap-2">
                                Governorate {isGeocoding && <span className="text-[10px] animate-pulse text-orange-500 font-normal">(Fetching...)</span>}
                            </Label>
                            <Input
                                id="governorate"
                                {...register('governorate', { required: 'Governorate is required' })}
                                placeholder="e.g. Nabeul"
                                className={isGeocoding ? "bg-orange-50/50" : ""}
                            />
                            {errors.governorate && <span className="text-sm text-red-500">{String(errors.governorate.message)}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city" className="flex items-center gap-2">
                                City {isGeocoding && <span className="text-[10px] animate-pulse text-orange-500 font-normal">(Fetching...)</span>}
                            </Label>
                            <Input
                                id="city"
                                {...register('city', { required: 'City is required' })}
                                placeholder="e.g. Hammamet"
                                className={isGeocoding ? "bg-orange-50/50" : ""}
                            />
                            {errors.city && <span className="text-sm text-red-500">{String(errors.city.message)}</span>}
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                                id="address"
                                {...register('address', { required: 'Address is required' })}
                                placeholder="e.g. 123 Beach Avenue"
                            />
                            {errors.address && <span className="text-sm text-red-500">{String(errors.address.message)}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button type="submit" className="bg-[#F17720] hover:bg-[#d6691c] text-white px-8">
                    Next Step
                </Button>
            </div>
        </form>
    )
}
