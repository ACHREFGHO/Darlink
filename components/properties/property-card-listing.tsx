'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Heart, Star } from 'lucide-react'
import { AuthModal } from '@/components/auth/auth-modal'
import { toggleFavorite } from '@/app/actions/favorites'
import { toast } from 'sonner'
import { useCurrency } from '@/components/providers/currency-provider'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
    property: any
    index: number
    isFavorited?: boolean
    userId?: string
}

export function PropertyCardListing({ property, index, isFavorited = false, userId }: PropertyCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isFav, setIsFav] = useState(isFavorited)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [isLoadingFav, setIsLoadingFav] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const { formatPrice } = useCurrency()

    const ratings = property.reviews?.map((r: any) => r.rating) || []
    const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : null
    const reviewCount = ratings.length

    // Collect all images: Main Image + Gallery Images
    const galleryImages = property.property_images?.map((img: any) => img.image_url) || []

    let allImages: string[] = []

    if (property.main_image_url) {
        allImages.push(property.main_image_url)
    }

    galleryImages.forEach((url: string) => {
        if (url !== property.main_image_url) {
            allImages.push(url)
        }
    })

    if (allImages.length === 0) {
        allImages = []
    }

    useEffect(() => {
        if (isHovered && allImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setCurrentImageIndex(0)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isHovered, allImages.length])

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!userId) {
            setShowAuthModal(true)
            return
        }

        if (isLoadingFav) return

        setIsFav(!isFav) // Optimistic update
        setIsLoadingFav(true)

        try {
            const result = await toggleFavorite(userId, property.id, isFav)
            if (!result.success) {
                setIsFav(isFav) // Revert
                console.error("Failed to toggle favorite")
            }
        } catch (error) {
            setIsFav(isFav) // Revert
            console.error(error)
        } finally {
            setIsLoadingFav(false)
        }
    }

    return (
        <>
            <div
                className="group relative block bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 h-full flex flex-col border border-slate-50/50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                    {/* Clickable Area Link */}
                    <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" />

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-white transition-all duration-500 group/heart border border-white/10"
                    >
                        <Heart
                            className={cn(
                                "w-5 h-5 transition-all duration-500",
                                isFav ? "fill-[#F17720] text-[#F17720] scale-110" : "text-white group-hover/heart:text-[#F17720]"
                            )}
                        />
                    </button>

                    {allImages.length > 0 ? (
                        <>
                            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                                {allImages.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={property.title}
                                        className={cn(
                                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                                            idx === currentImageIndex ? "opacity-100" : "opacity-0"
                                        )}
                                        loading="lazy"
                                    />
                                ))}
                            </div>

                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                                    {allImages.slice(0, 5).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "h-1.5 rounded-full shadow-sm transition-all duration-500",
                                                idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300 bg-slate-50">
                            <span className="text-sm font-black uppercase tracking-widest">No Image</span>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <Badge className="bg-white/90 text-[#0B3D6F] backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border-0 rounded-lg">
                            {property.type}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex flex-col flex-1 relative bg-white">
                    <Link href={`/properties/${property.id}`} className="absolute inset-0 z-0" />

                    <div className="space-y-1 relative z-10 pointer-events-none">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-400 gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#F17720]" />
                                <span className="text-[11px] font-bold tracking-tight">{property.city}, {property.governorate}</span>
                            </div>
                            {avgRating ? (
                                <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                                    <Star className="w-3 h-3 fill-[#F17720] text-[#F17720]" />
                                    <span className="text-[10px] font-black text-[#0B3D6F]">{avgRating}</span>
                                    <span className="text-[9px] text-slate-400 font-bold">({reviewCount})</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    <span className="text-[10px] font-black text-[#0B3D6F] uppercase tracking-tighter">NEW</span>
                                </div>
                            )}
                        </div>
                        <h3 className="font-black text-xl text-[#0B3D6F] leading-tight tracking-tight group-hover:text-[#F17720] transition-colors line-clamp-1">
                            {property.title}
                        </h3>
                    </div>

                    <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed flex-1 font-medium relative z-10 pointer-events-none">
                        {property.description}
                    </p>

                    {/* Category Badges */}
                    {property.property_specs && property.property_specs.length > 0 && (
                        <div className="flex flex-wrap gap-2 relative z-10 pointer-events-none">
                            {property.property_specs.map((spec: any, idx: number) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-slate-50 text-slate-500 border-slate-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
                                >
                                    {spec.category}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex flex-col pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">From</span>
                            <div className="flex items-baseline gap-1">
                                {(() => {
                                    const prices = property.rooms?.map((r: any) => r.price_per_night) || []
                                    const minPrice = prices.length > 0 ? Math.min(...prices) : null
                                    return (
                                        <>
                                            <span className="font-black text-2xl text-[#0B3D6F] tracking-tighter">
                                                {minPrice !== null ? formatPrice(minPrice) : 'TBD'}
                                            </span>
                                            {minPrice !== null && (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/night</span>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>

                        <Button
                            className="rounded-xl bg-[#0B3D6F] hover:bg-[#F17720] text-white px-6 h-11 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 transition-all hover:scale-105 active:scale-95 pointer-events-auto relative z-20"
                            asChild
                        >
                            <Link href={`/properties/${property.id}`}>
                                Details
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onOpenChange={setShowAuthModal}
                defaultView="signin"
            />
        </>
    )
}
