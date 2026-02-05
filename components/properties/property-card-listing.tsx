'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Heart } from 'lucide-react'
import { AuthModal } from '@/components/auth/auth-modal'
import { toggleFavorite } from '@/app/actions/favorites'
import { toast } from 'sonner' // Assuming sonner is used, or console.log fallback

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
                className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-200">
                    {/* Clickable Area Link */}
                    <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" />

                    {/* Favorite Button - z-20 to sit on top of Link */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/90 transition-all duration-300 group/heart"
                    >
                        <Heart
                            className={`w-5 h-5 transition-colors duration-300 ${isFav ? 'fill-[#F17720] text-[#F17720]' : 'text-white group-hover/heart:text-[#F17720]'}`}
                        />
                    </button>

                    {allImages.length > 0 ? (
                        <>
                            {allImages.map((src, idx) => (
                                <img
                                    key={idx}
                                    src={src}
                                    alt={property.title}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    loading="lazy"
                                />
                            ))}

                            {isHovered && allImages.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 px-4 pointer-events-none">
                                    {allImages.slice(0, 5).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100">
                            <span className="text-lg font-medium">No Image</span>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <Badge className="bg-white/90 text-[#0B3D6F] backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm border-0">
                            {property.type}
                        </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex flex-col flex-1 relative">
                    <Link href={`/properties/${property.id}`} className="absolute inset-0 z-0" />

                    <div className="flex justify-between items-start gap-2 relative z-10 pointer-events-none">
                        <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-[#F17720] transition-colors">
                            {property.title}
                        </h3>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm relative z-10 pointer-events-none">
                        <MapPin className="w-4 h-4 mr-1 text-[#F17720]" />
                        <span className="font-medium">{property.city}, {property.governorate}</span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1 relative z-10 pointer-events-none">
                        {property.description}
                    </p>

                    {/* Category Badges */}
                    {property.property_specs && property.property_specs.length > 0 && (
                        <div className="flex flex-wrap gap-2 relative z-10 pointer-events-none">
                            {property.property_specs.map((spec: any, idx: number) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-[#F17720]/5 text-[#F17720] border-[#F17720]/20 text-xs font-medium px-2 py-0.5"
                                >
                                    {spec.category === 'Family' && '👨‍👩‍👧‍👦 '}
                                    {spec.category === 'Friends' && '🎉 '}
                                    {spec.category === 'Company' && '💼 '}
                                    {spec.category}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 mt-2 border-t flex items-center justify-between relative z-10">
                        <div className="flex-1 pointer-events-none">
                            <span className="block text-xs text-gray-400">Starting from</span>
                            {(() => {
                                const prices = property.rooms?.map((r: any) => r.price_per_night) || []
                                const minPrice = prices.length > 0 ? Math.min(...prices) : null
                                return (
                                    <>
                                        <span className="font-bold text-lg text-[#0B3D6F]">{minPrice !== null ? minPrice : 'TBD'}</span>
                                        {minPrice !== null && <span className="text-xs text-gray-500"> / night</span>}
                                    </>
                                )
                            })()}
                        </div>
                        <Button size="sm" variant="ghost" className="text-[#F17720] hover:text-[#0B3D6F] hover:bg-orange-50 font-bold -mr-2 pointer-events-auto relative z-20" asChild>
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
