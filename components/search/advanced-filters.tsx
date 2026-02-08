'use client'

import React, { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'

// Amenity options with descriptions
export const AVAILABLE_AMENITIES = [
    { id: 'wifi', label: 'Fast Wi-Fi', description: 'High-speed internet' },
    { id: 'parking', label: 'Free Parking', description: 'On-site parking available' },
    { id: 'ac', label: 'Air Conditioning', description: 'Climate control' },
    { id: 'kitchen', label: 'Kitchen', description: 'Full kitchen access' },
    { id: 'washer', label: 'Washer/Dryer', description: 'Laundry facilities' },
    { id: 'dishwasher', label: 'Dishwasher', description: 'Automatic dishwasher' },
    { id: 'heating', label: 'Heating', description: 'Central heating' },
    { id: 'pool', label: 'Pool', description: 'Swimming pool' },
    { id: 'gym', label: 'Gym', description: 'Fitness center' },
    { id: 'workspace', label: 'Workspace', description: 'Dedicated work area' },
    { id: 'tv', label: 'Smart TV', description: 'Entertainment system' },
    { id: 'pets', label: 'Pets Allowed', description: 'Pet-friendly' },
]

// Property type options
export const PROPERTY_TYPES = [
    { id: 'House', label: 'Houses', description: 'Entire house' },
    { id: 'Apartment', label: 'Apartments', description: 'Apartment units' },
    { id: 'Guesthouse', label: 'Guesthouses', description: 'Guesthouse or cottage' },
]

interface AdvancedFiltersProps {
    priceRange: [number, number]
    onPriceChange: (range: [number, number]) => void
    selectedAmenities: string[]
    onAmenitiesChange: (amenities: string[]) => void
    selectedPropertyTypes: string[]
    onPropertyTypesChange: (types: string[]) => void
    checkInDate: Date | null
    checkOutDate: Date | null
    onCheckInChange: (date: Date | null) => void
    onCheckOutChange: (date: Date | null) => void
    maxPrice?: number
    onReset?: () => void
}

export function AdvancedFilters({
    priceRange,
    onPriceChange,
    selectedAmenities,
    onAmenitiesChange,
    selectedPropertyTypes,
    onPropertyTypesChange,
    checkInDate,
    checkOutDate,
    onCheckInChange,
    onCheckOutChange,
    maxPrice = 10000,
    onReset
}: AdvancedFiltersProps) {
    const [localPrice, setLocalPrice] = useState<[number, number]>(priceRange)
    const [localAmenities, setLocalAmenities] = useState<string[]>(selectedAmenities)
    const [localTypes, setLocalTypes] = useState<string[]>(selectedPropertyTypes)
    const [localCheckIn, setLocalCheckIn] = useState<Date | null>(checkInDate)
    const [localCheckOut, setLocalCheckOut] = useState<Date | null>(checkOutDate)

    const handleApplyFilters = () => {
        onPriceChange(localPrice)
        onAmenitiesChange(localAmenities)
        onPropertyTypesChange(localTypes)
        onCheckInChange(localCheckIn)
        onCheckOutChange(localCheckOut)
    }

    const handleReset = () => {
        setLocalPrice([0, maxPrice])
        setLocalAmenities([])
        setLocalTypes([])
        setLocalCheckIn(null)
        setLocalCheckOut(null)
        if (onReset) onReset()
    }

    const toggleAmenity = (amenityId: string) => {
        setLocalAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        )
    }

    const togglePropertyType = (typeId: string) => {
        setLocalTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        )
    }

    const activeFiltersCount = 
        (localPrice[0] > 0 || localPrice[1] < maxPrice ? 1 : 0) +
        localAmenities.length +
        localTypes.length +
        (localCheckIn ? 1 : 0) +
        (localCheckOut ? 1 : 0)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "relative gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
                        activeFiltersCount > 0
                            ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                            : "hover:border-slate-300"
                    )}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Advanced Filters</DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* Date Range Filter */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Dates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 block mb-2">Check-in</label>
                                <input
                                    type="date"
                                    value={localCheckIn ? localCheckIn.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const date = new Date(e.target.value)
                                            setLocalCheckIn(date)
                                        } else {
                                            setLocalCheckIn(null)
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 block mb-2">Check-out</label>
                                <input
                                    type="date"
                                    value={localCheckOut ? localCheckOut.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const date = new Date(e.target.value)
                                            setLocalCheckOut(date)
                                        } else {
                                            setLocalCheckOut(null)
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-slate-900">Price per Night</h3>
                            <span className="text-sm font-semibold text-blue-600">
                                ${localPrice[0]} - ${localPrice[1]}
                            </span>
                        </div>
                        <Slider
                            value={localPrice}
                            onValueChange={(value) => setLocalPrice(value as [number, number])}
                            min={0}
                            max={maxPrice}
                            step={50}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>$0</span>
                            <span>${maxPrice}</span>
                        </div>
                    </div>

                    {/* Property Type Filter */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Property Type</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PROPERTY_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => togglePropertyType(type.id)}
                                    className={cn(
                                        "p-3 rounded-lg border-2 transition-all text-left hover:border-blue-400",
                                        localTypes.includes(type.id)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={localTypes.includes(type.id)}
                                            onChange={() => togglePropertyType(type.id)}
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">{type.label}</p>
                                            <p className="text-xs text-slate-500">{type.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amenities Filter */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Amenities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {AVAILABLE_AMENITIES.map(amenity => (
                                <button
                                    key={amenity.id}
                                    onClick={() => toggleAmenity(amenity.id)}
                                    className={cn(
                                        "p-3 rounded-lg border-2 transition-all text-left hover:border-blue-400",
                                        localAmenities.includes(amenity.id)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={localAmenities.includes(amenity.id)}
                                            onChange={() => toggleAmenity(amenity.id)}
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">{amenity.label}</p>
                                            <p className="text-xs text-slate-500">{amenity.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                    >
                        Reset Filters
                    </Button>
                    <Button
                        onClick={handleApplyFilters}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
