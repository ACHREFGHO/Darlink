'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReviewModalProps {
    bookingId: string
    propertyId: string
    userId: string
    existingReview?: any
}

export function ReviewModal({ bookingId, propertyId, userId, existingReview }: ReviewModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [comment, setComment] = useState(existingReview?.comment || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hoveredStar, setHoveredStar] = useState(0)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async () => {
        if (rating === 0) return toast.error("Please select a star rating")

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    booking_id: bookingId,
                    property_id: propertyId,
                    user_id: userId,
                    rating,
                    comment
                })

            if (error) throw error

            toast.success("Review submitted! Thank you.")
            setIsOpen(false)
            router.refresh()

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (existingReview) {
        return (
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{existingReview.rating}</span>
                <span className="text-xs text-muted-foreground ml-1">You rated this</span>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[#F17720] text-[#F17720] hover:bg-orange-50">
                    <Star className="w-4 h-4" />
                    Rate Stay
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#0B3D6F] text-center text-xl">Rate your stay</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Star Rating */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-transform hover:scale-110 focus:outline-none"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`w-10 h-10 ${star <= (hoveredStar || rating)
                                            ? 'fill-[#F17720] text-[#F17720]'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-gray-700">Write a review (optional)</label>
                        <Textarea
                            placeholder="How was your experience?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="resize-none min-h-[100px] focus-visible:ring-[#0B3D6F]"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-[#0B3D6F] hover:bg-[#092c50] text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
