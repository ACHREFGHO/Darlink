'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MapPin, Zap, Clock } from 'lucide-react'

/**
 * Shimmer loading animation overlay
 */
export function ShimmerLoading({ className }: { className?: string }) {
    return (
        <div className={cn(
            'relative overflow-hidden bg-gradient-to-r from-transparent via-white/30 to-transparent',
            'animate-shimmer',
            className
        )}>
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    )
}

/**
 * Pulse loading animation
 */
export function PulseLoader() {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-[#F17720] rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-[#F17720] rounded-full animate-pulse delay-100" />
            <div className="w-3 h-3 bg-[#F17720] rounded-full animate-pulse delay-200" />
        </div>
    )
}

/**
 * Spinning loader
 */
export function SpinnerLoader({ 
    size = 'md',
    color = 'blue'
}: { 
    size?: 'sm' | 'md' | 'lg'
    color?: 'blue' | 'orange'
}) {
    const sizeClass = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }[size]

    const colorClass = color === 'orange' 
        ? 'border-[#F17720]'
        : 'border-[#0B3D6F]'

    return (
        <div className={cn(
            'border-3 border-slate-200 rounded-full animate-spin',
            `border-t-${colorClass}`,
            sizeClass
        )}
        style={{
            borderTopColor: color === 'orange' ? '#F17720' : '#0B3D6F'
        }}
        />
    )
}

/**
 * Page loading screen
 */
export function PageLoader() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[999] flex items-center justify-center">
            <div className="text-center space-y-4">
                <SpinnerLoader size="lg" color="blue" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">Loading</p>
                    <p className="text-xs text-slate-500">Please wait...</p>
                </div>
            </div>
        </div>
    )
}

/**
 * Loading card with skeleton
 */
export function LoadingCard() {
    return (
        <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
            <div className="aspect-video bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse relative">
                <ShimmerLoading className="absolute inset-0" />
            </div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                </div>
            </div>
        </div>
    )
}

/**
 * Bounce loader - playful animation
 */
export function BounceLoader() {
    return (
        <div className="flex items-end justify-center gap-1 h-8">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="w-2 h-2 bg-[#F17720] rounded-full"
                    style={{
                        animation: `bounce 1.4s infinite ${i * 0.16}s`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0) translateY(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
}

/**
 * Wave loader animation
 */
export function WaveLoader() {
    return (
        <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="w-1 bg-[#0B3D6F] rounded-full"
                    style={{
                        height: '1rem',
                        animation: `wave 1.2s infinite ${i * 0.1}s`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes wave {
                    0%, 100% {
                        transform: scaleY(0.4);
                    }
                    50% {
                        transform: scaleY(1);
                    }
                }
            `}</style>
        </div>
    )
}

/**
 * Search results loading state with progress
 */
export function SearchLoadingState() {
    return (
        <div className="space-y-8">
            {/* Header with progress */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="h-8 bg-slate-200 rounded-lg w-2/3 animate-pulse" />
                        <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <SpinnerLoader size="sm" color="blue" />
                        <span className="text-xs font-bold text-blue-700">Loading...</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F17720] rounded-full w-2/3 animate-pulse" />
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        </div>
    )
}

/**
 * Property detail loading state
 */
export function PropertyDetailLoadingState() {
    return (
        <div className="space-y-6">
            {/* Hero image */}
            <div className="relative aspect-video rounded-3xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse">
                <ShimmerLoading className="absolute inset-0" />
            </div>

            {/* Content section */}
            <div className="max-w-4xl space-y-6">
                {/* Title section */}
                <div className="space-y-3">
                    <div className="h-8 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border border-slate-100 rounded-lg space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                            <div className="h-6 bg-slate-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Description skeleton */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="h-5 bg-slate-200 rounded w-40 animate-pulse" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: i === 3 ? '60%' : '100%' }} />
                    ))}
                </div>

                {/* Amenities skeleton */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="h-5 bg-slate-200 rounded w-40 animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Minimal inline loader
 */
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-3 h-3 border-2 border-slate-300 border-t-[#F17720] rounded-full animate-spin" />
            <span className="font-medium">{text}</span>
        </div>
    )
}

/**
 * Skeleton with shimmer effect
 */
export function ShimmerSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('relative overflow-hidden bg-slate-200 rounded-lg', className)}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
    )
}
