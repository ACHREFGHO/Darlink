'use client'

import React, { useState } from 'react'
import { Star, MessageSquare, ShieldCheck, ThumbsUp, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from '@/components/providers/language-provider'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

interface PropertyReviewsProps {
    propertyId: string
    reviews: any[]
    ratingInfo: any
    userId?: string
}

export function PropertyReviews({ propertyId, reviews, ratingInfo, userId }: PropertyReviewsProps) {
    const { t } = useLanguage()
    const supabase = createClient()
    const [isWriting, setIsWriting] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State for new review
    const [comment, setComment] = useState('')
    const [scores, setScores] = useState({
        cleanliness: 5,
        accuracy: 5,
        communication: 5,
        location: 5,
        checkIn: 5,
        value: 5
    })

    const averageRating = ratingInfo?.average_rating || 0
    const reviewCount = ratingInfo?.review_count || 0

    const categories = [
        { label: t.property.cleanliness, key: 'avg_cleanliness', score: ratingInfo?.avg_cleanliness || 0 },
        { label: t.property.accuracy, key: 'avg_accuracy', score: ratingInfo?.avg_accuracy || 0 },
        { label: t.property.communication, key: 'avg_communication', score: ratingInfo?.avg_communication || 0 },
        { label: t.property.locationRating, key: 'avg_location', score: ratingInfo?.avg_location || 0 },
        { label: t.property.checkIn, key: 'avg_check_in', score: ratingInfo?.avg_check_in || 0 },
        { label: t.property.value, key: 'avg_value', score: ratingInfo?.avg_value || 0 },
    ]

    const handleSubmit = async () => {
        if (!userId) {
            toast.error("Please log in to leave a review")
            return
        }

        if (comment.length < 5) {
            toast.error("Please write a longer comment")
            return
        }

        setIsSubmitting(true)
        try {
            // Calculate overall rating for this review
            const overall = Object.values(scores).reduce((a, b) => a + b, 0) / 6

            const { error } = await supabase
                .from('reviews')
                .insert({
                    property_id: propertyId,
                    user_id: userId,
                    rating: overall,
                    cleanliness: scores.cleanliness,
                    accuracy: scores.accuracy,
                    communication: scores.communication,
                    location_rating: scores.location,
                    check_in: scores.checkIn,
                    value: scores.value,
                    comment: comment
                })

            if (error) throw error

            toast.success("Review submitted! Thank you.")
            setIsWriting(false)
            // Ideally revalidate or refresh here
            window.location.reload()
        } catch (error: any) {
            toast.error("Failed to submit review: " + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return

        try {
            const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
            if (error) throw error
            toast.success("Review deleted")
            window.location.reload()
        } catch (error: any) {
            toast.error("Delete failed: " + error.message)
        }
    }

    return (
        <div className="space-y-12 py-8">
            <Separator />

            {/* Summary Section */}
            <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <Star className="w-8 h-8 text-[#F17720] fill-[#F17720]" />
                        <h2 className="text-3xl font-extrabold text-[#0B3D6F]">
                            {averageRating > 0 ? averageRating : 'New'} · {reviewCount} {t.property.reviews}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-600">{cat.label}</span>
                                    <span className="text-[#0B3D6F]">{cat.score || '0.0'}</span>
                                </div>
                                <Progress value={(cat.score / 5) * 100} className="h-1 bg-slate-100" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Write a Review Button */}
                <div className="md:w-1/3 flex items-start justify-end">
                    <Dialog open={isWriting} onOpenChange={setIsWriting}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#0B3D6F] text-white hover:bg-[#092d52] px-8 py-6 rounded-2xl font-bold shadow-lg">
                                <MessageSquare className="w-5 h-5 mr-2" />
                                {t.property.writeReview}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl rounded-3xl p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-extrabold text-[#0B3D6F]">Rate your stay</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-6">
                                    {Object.entries(scores).map(([key, value]) => (
                                        <div key={key} className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{key}</label>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    value={[value]}
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    onValueChange={(val: number[]) => setScores(s => ({ ...s, [key]: val[0] }))}
                                                />
                                                <span className="font-bold text-[#F17720] w-4 text-center">{value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Experience</label>
                                    <Textarea
                                        placeholder="Tell us about your stay..."
                                        className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 focus:ring-[#0B3D6F]"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full bg-[#F17720] hover:bg-[#d1661b] text-white h-14 rounded-2xl text-lg font-bold"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Post Review"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-slate-100">
                                    <AvatarImage src={review.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-[#0B3D6F] text-white">
                                        {review.profiles?.full_name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-[#0B3D6F]">{review.profiles?.full_name || 'Anonymous User'}</h4>
                                        <div className="flex items-center text-[#F17720]">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-bold ml-1">{Number(review.rating).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{format(new Date(review.created_at), 'MMMM yyyy')}</span>
                                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <ShieldCheck className="w-3 h-3" />
                                            Verified Stayer
                                        </span>
                                    </div>
                                </div>
                                {userId === review.user_id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto text-slate-300 hover:text-red-500"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-slate-600 leading-relaxed line-clamp-4">
                                {review.comment}
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <Button variant="ghost" className="text-xs h-8 text-slate-400 hover:text-[#0B3D6F] hover:bg-slate-50 gap-2">
                                    <ThumbsUp className="w-3 h-3" /> Helpfull
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium italic">
                            {t.property.noReviews}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
