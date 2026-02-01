'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

interface PropertyCardProps {
    property: any
    index: number
}

export function PropertyCardListing({ property }: PropertyCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Collect all images: Main Image + Gallery Images
    // Logic: property.property_images is an array of objects { image_url, ... }
    const galleryImages = property.property_images?.map((img: any) => img.image_url) || []

    // Ensure main image is first if it exists, but avoid duplicates if main image is also in gallery
    let allImages: string[] = []

    if (property.main_image_url) {
        allImages.push(property.main_image_url)
    }

    // Append gallery images that are not the main image
    galleryImages.forEach((url: string) => {
        if (url !== property.main_image_url) {
            allImages.push(url)
        }
    })

    if (allImages.length === 0) {
        allImages = [] // No images
    }

    useEffect(() => {
        if (isHovered && allImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
            }, 1000) // Change every 1 second
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setCurrentImageIndex(0) // Reset to cover image on mouse leave? Or keep position?
            // "cover i can see an image and when i hover ... animation" -> implies reset or start from cover
            // Let's reset to 0 (cover) for cleaner UX
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isHovered, allImages.length])

    return (
        <Link
            href={`/properties/${property.id}`}
            className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-200">
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

                        {/* Dots Indicator (only if hovered and multiple images) */}
                        {isHovered && allImages.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 px-4">
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

                <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-white/90 text-[#0B3D6F] hover:bg-white backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm border-0">
                        {property.type}
                    </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-[#F17720] transition-colors">
                        {property.title}
                    </h3>
                </div>

                <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1 text-[#F17720]" />
                    <span className="font-medium">{property.city}, {property.governorate}</span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                    {property.description}
                </p>

                <div className="pt-4 mt-2 border-t flex items-center justify-between">
                    <div className="flex-1">
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
                    <Button size="sm" variant="ghost" className="text-[#F17720] hover:text-[#0B3D6F] hover:bg-orange-50 font-bold -mr-2">
                        Details
                    </Button>
                </div>
            </div>
        </Link>
    )
}
