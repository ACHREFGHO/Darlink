'use client'

import { Button } from '@/components/ui/button'
import {
    Users, Briefcase, PartyPopper, Wifi, Waves, Car, Wind, Tv, Utensils, Monitor, Coffee
} from 'lucide-react'
import { PropertyFormData } from '@/components/properties/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Step3Props {
    data: PropertyFormData
    updateData: (data: Partial<PropertyFormData>) => void
    onBack: () => void
    onSubmit: (data?: Partial<PropertyFormData>) => void
    isSubmitting: boolean
    mode?: 'create' | 'edit'
}

type SpecCategory = 'Family' | 'Friends' | 'Company'

const CATEGORIES: { id: SpecCategory; label: string; icon: any; description: string }[] = [
    {
        id: 'Family',
        label: 'Family',
        icon: Users,
        description: 'Safe, spacious, and kid-friendly.'
    },
    {
        id: 'Friends',
        label: 'Friends',
        icon: PartyPopper,
        description: 'Perfect for group trips and fun.'
    },
    {
        id: 'Company',
        label: 'Company',
        icon: Briefcase,
        description: 'Work-ready with WiFi and desks.'
    }
]

const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'ac', label: 'A/C', icon: Wind },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'workspace', label: 'Work-desk', icon: Monitor },
    { id: 'coffee', label: 'Coffee', icon: Coffee },
]

export function Step3Specs({ data, updateData, onBack, onSubmit, isSubmitting, mode = 'create' }: Step3Props) {
    // Controlled component: use data.specs directly
    const selectedSpecs = data.specs || []
    const selectedAmenities = data.amenities || []

    const toggleSpec = (specId: string) => {
        const newSpecs = selectedSpecs.includes(specId)
            ? selectedSpecs.filter(id => id !== specId)
            : [...selectedSpecs, specId]

        updateData({ specs: newSpecs })
    }

    const toggleAmenity = (amenityId: string) => {
        const newAmenities = selectedAmenities.includes(amenityId)
            ? selectedAmenities.filter(id => id !== amenityId)
            : [...selectedAmenities, amenityId]

        updateData({ amenities: newAmenities })
    }

    const handleFinalSubmit = () => {
        if (selectedSpecs.length === 0) {
            toast.error("Please select at least one category")
            return
        }
        // Data is already updated via updateData, but we pass it just in case logic depends on it
        onSubmit({ specs: selectedSpecs, amenities: selectedAmenities })
    }

    return (
        <div className="space-y-10">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-[#0B3D6F]">Property Category</h2>
                    <p className="text-sm text-muted-foreground">Who is this property best suited for?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon
                        const isSelected = selectedSpecs.includes(category.id)

                        return (
                            <div
                                key={category.id}
                                onClick={() => toggleSpec(category.id)}
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-[#F17720]/50",
                                    isSelected
                                        ? "border-[#F17720] bg-[#F17720]/5 shadow-sm"
                                        : "border-transparent bg-gray-50 hover:bg-gray-100"
                                )}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        isSelected ? "bg-[#F17720] text-white" : "bg-white text-gray-500"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={cn("font-semibold", isSelected ? "text-[#0B3D6F]" : "text-gray-900")}>
                                            {category.label}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-[#0B3D6F]">Amenities & Features</h2>
                    <p className="text-sm text-muted-foreground">What essentials do you offer?</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AMENITIES.map((item) => {
                        const Icon = item.icon
                        const isSelected = selectedAmenities.includes(item.id)

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleAmenity(item.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:border-[#F17720]/30",
                                    isSelected
                                        ? "border-[#F17720] bg-orange-50/50 text-[#F17720]"
                                        : "border-slate-100 bg-white text-slate-500"
                                )}
                            >
                                <Icon className={cn("w-6 h-6 mb-2", isSelected ? "animate-bounce" : "")} />
                                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="pt-6 border-t mt-8">
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                        Back
                    </Button>
                    <Button
                        onClick={handleFinalSubmit}
                        className="bg-[#F17720] hover:bg-[#d1661b] text-white px-8 h-12 text-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Submit Listing')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
