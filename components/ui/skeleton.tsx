'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'text' | 'circle' | 'rect'
    animated?: boolean
}

/**
 * Base skeleton component with variants
 */
export function Skeleton({
    className,
    variant = 'default',
    animated = true,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200',
                variant === 'text' && 'h-4 rounded',
                variant === 'circle' && 'rounded-full aspect-square',
                variant === 'rect' && 'rounded-lg aspect-video',
                variant === 'default' && 'rounded-lg',
                animated && 'animate-pulse',
                className
            )}
            {...props}
        />
    )
}

/**
 * Property card skeleton
 */
export function PropertyCardSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
            {/* Image placeholder */}
            <Skeleton className="w-full h-48 rounded-none" />

            {/* Content area */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton variant="text" className="w-3/4" />

                {/* Location */}
                <div className="flex gap-2">
                    <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                    <Skeleton variant="text" className="flex-1" />
                </div>

                {/* Price and rating */}
                <div className="flex justify-between items-center">
                    <Skeleton variant="text" className="w-20" />
                    <Skeleton className="w-12 h-5 rounded-full" />
                </div>
            </div>
        </div>
    )
}

/**
 * Property list item skeleton
 */
export function PropertyListSkeleton() {
    return (
        <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <Skeleton className="w-24 h-24 flex-shrink-0 rounded-lg" />

            {/* Content */}
            <div className="flex-1 space-y-3">
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="text" className="w-3/4 h-3" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton variant="text" className="w-16" />
                    <Skeleton className="w-10 h-4 rounded-full" />
                </div>
            </div>
        </div>
    )
}

/**
 * Search filters skeleton
 */
export function SearchFiltersSkeleton() {
    return (
        <div className="space-y-4">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(6)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-10 w-24 rounded-full flex-shrink-0"
                    />
                ))}
            </div>

            {/* Filter button */}
            <Skeleton className="w-full h-12 rounded-xl" />
        </div>
    )
}

/**
 * Property detail page skeleton
 */
export function PropertyDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Hero image */}
            <Skeleton className="w-full h-96 rounded-xl" />

            {/* Title section */}
            <div className="space-y-3">
                <Skeleton variant="text" className="w-3/4 h-8" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton variant="text" className="w-48" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-lg space-y-2">
                        <Skeleton variant="text" className="w-1/2 h-3" />
                        <Skeleton variant="text" className="w-3/4" />
                    </div>
                ))}
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t">
                <Skeleton variant="text" className="w-40 h-5" />
                {[...Array(4)].map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="text"
                        className={i === 3 ? 'w-3/5' : 'w-full'}
                        style={{ height: '1rem' }}
                    />
                ))}
            </div>

            {/* Amenities */}
            <div className="space-y-3 pt-4 border-t">
                <Skeleton variant="text" className="w-40 h-5" />
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Search results grid skeleton with staggered animation
 */
export function SearchResultsSkeleton({ count = 8 }: { count?: number }) {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        animation: `slideInUp 0.6s ease-out ${i * 0.05}s both`,
                    }}
                >
                    <PropertyCardSkeleton />
                </div>
            ))}
            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    )
}

/**
 * Map view skeleton
 */
export function MapSkeleton() {
    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-100">
            <Skeleton className="w-full h-full rounded-none" />
            
            {/* Map controls placeholder */}
            <div className="absolute top-6 right-6 space-y-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
        </div>
    )
}

/**
 * Booking widget skeleton
 */
export function BookingWidgetSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            {/* Price per night */}
            <div className="space-y-2">
                <Skeleton variant="text" className="w-24 h-3" />
                <Skeleton variant="text" className="w-32" />
            </div>

            {/* Date inputs */}
            <div className="space-y-2">
                <Skeleton className="w-full h-12 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-lg" />
            </div>

            {/* Guests input */}
            <Skeleton className="w-full h-12 rounded-lg" />

            {/* Reserve button */}
            <Skeleton className="w-full h-14 rounded-lg" />

            {/* Info text */}
            <Skeleton variant="text" className="w-2/3 h-3" />
        </div>
    )
}

/**
 * Staggered skeleton list
 */
export function SkeletonList({ count = 5, variant = 'default' }: { count?: number; variant?: 'card' | 'list' | 'default' }) {
    return (
        <div className={cn(
            variant === 'list' ? 'space-y-2' : 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}>
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        animation: `fadeIn 0.5s ease-out ${i * 0.08}s both`,
                    }}
                >
                    {variant === 'list' ? <PropertyListSkeleton /> : <PropertyCardSkeleton />}
                </div>
            ))}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
}

/**
 * Multi-column loading state
 */
export function SkeletonColumns({ columns = 3, rows = 4 }: { columns?: number; rows?: number }) {
    return (
        <div className={cn('grid gap-4', `grid-cols-${columns}`)}>
            {[...Array(columns * rows)].map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-32 rounded-lg"
                    style={{
                        animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite ${i * 0.1}s`,
                    }}
                />
            ))}
        </div>
    )
}
