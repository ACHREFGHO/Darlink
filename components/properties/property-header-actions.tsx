'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Share2 } from 'lucide-react'
import { toggleFavorite } from '@/app/actions/favorites'
import { AuthModal } from '@/components/auth/auth-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PropertyHeaderActionsProps {
    propertyId: string
    isFavorited?: boolean
    userId?: string
}

export function PropertyHeaderActions({ propertyId, isFavorited = false, userId }: PropertyHeaderActionsProps) {
    const [isFav, setIsFav] = useState(isFavorited)
    const [isLoadingFav, setIsLoadingFav] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard!", { description: "You can now share it with your friends." })
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    const handleFavoriteClick = async () => {
        if (!userId) {
            setShowAuthModal(true)
            return
        }

        if (isLoadingFav) return

        const newStatus = !isFav
        setIsFav(newStatus) // Optimistic update
        setIsLoadingFav(true)

        try {
            const result = await toggleFavorite(userId, propertyId, isFav)
            if (!result.success) {
                setIsFav(isFav) // Revert on failure
                toast.error("Failed to update favorites")
            } else {
                toast.success(newStatus ? "Added to favorites" : "Removed from favorites")
            }
        } catch (error) {
            setIsFav(isFav) // Revert on error
            toast.error("An error occurred")
        } finally {
            setIsLoadingFav(false)
        }
    }

    return (
        <div className="flex gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-100 transition-colors"
                onClick={handleShare}
                title="Share this property"
            >
                <Share2 className="w-5 h-5 text-slate-600" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-100 transition-colors"
                onClick={handleFavoriteClick}
                title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        isFav ? "fill-[#F17720] text-[#F17720]" : "text-slate-600"
                    )}
                />
            </Button>

            <AuthModal
                isOpen={showAuthModal}
                onOpenChange={setShowAuthModal}
                defaultView="signin"
                onSuccess={() => {
                    toast.success("Logged in successfully!")
                }}
            />
        </div>
    )
}
