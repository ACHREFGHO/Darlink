'use client'

import React from 'react'
import { MapPin, Users, DollarSign, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapLegendProps {
    className?: string
    showPrice?: boolean
    showClustering?: boolean
}

export function MapLegend({ className, showPrice = true, showClustering = true }: MapLegendProps) {
    return (
        <div className={cn(
            "bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/50 space-y-3",
            className
        )}>
            <div className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">
                Map Legend
            </div>

            {/* Individual Property */}
            <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-xs">
                    $450
                </div>
                <span className="text-xs text-slate-600 font-semibold">Individual property</span>
            </div>

            {/* Hovered Property */}
            <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-[#F17720] border-2 border-white text-white font-bold text-xs shadow-lg">
                    $450
                </div>
                <span className="text-xs text-slate-600 font-semibold">Selected property</span>
            </div>

            {/* Cluster */}
            {showClustering && (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F17720] flex items-center justify-center text-white font-black shadow-lg ring-2 ring-white">
                        <span className="text-sm">5</span>
                    </div>
                    <span className="text-xs text-slate-600 font-semibold">Property cluster<br/>(zoom in to see details)</span>
                </div>
            )}

            {/* Price Indicator */}
            {showPrice && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-600">
                        Price Range
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Budget</span>
                        <span className="font-bold text-[#0B3D6F]">$0 - $100</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Mid-range</span>
                        <span className="font-bold text-[#0B3D6F]">$100 - $300</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Premium</span>
                        <span className="font-bold text-[#F17720]">$300+</span>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Floating control panel with map controls and info
 */
export function MapControlPanel({
    propertiesCount,
    filteredCount,
    zoom,
    className
}: {
    propertiesCount: number
    filteredCount: number
    zoom: number
    className?: string
}) {
    const hiddenCount = propertiesCount - filteredCount

    return (
        <div className={cn(
            "bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/50 space-y-3",
            className
        )}>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                    <Users className="w-4 h-4" />
                    Properties
                </div>
                <div className="text-lg font-black text-[#0B3D6F]">
                    {filteredCount}
                    <span className="text-xs text-slate-400 ml-2 font-bold">visible</span>
                </div>
            </div>

            {hiddenCount > 0 && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                    <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
                    {hiddenCount} hidden by filters
                </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-bold">Zoom: </span>
                {Math.round(zoom * 10) / 10}x
            </div>
        </div>
    )
}
