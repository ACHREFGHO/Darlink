'use client'

import { Button } from '@/components/ui/button'
import { Users, Heart, Briefcase, PartyPopper } from 'lucide-react'
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

export function Step3Specs({ data, updateData, onBack, onSubmit, isSubmitting, mode = 'create' }: Step3Props) {
    // Controlled component: use data.specs directly
    const selectedSpecs = data.specs || []

    const toggleSpec = (specId: string) => {
        const newSpecs = selectedSpecs.includes(specId)
            ? selectedSpecs.filter(id => id !== specId)
            : [...selectedSpecs, specId]

        updateData({ specs: newSpecs })
    }

    const handleFinalSubmit = () => {
        if (selectedSpecs.length === 0) {
            toast.error("Please select at least one category")
            return
        }
        // Data is already updated via toggleSpec, but we pass it just in case logic depends on it
        onSubmit({ specs: selectedSpecs })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#0B3D6F]">Categories & Amenities</h2>
                <p className="text-sm text-muted-foreground">Who is this property best suited for?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="flex items-start gap-4">
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
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
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
