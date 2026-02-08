'use client'

import React, { useState, useMemo } from 'react'
import { MapPin, ChevronUp, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/components/providers/currency-provider'

interface PropertyCluster {
    id: string
    latitude: number
    longitude: number
    count: number
    properties: any[]
    averagePrice?: number
    zoom: number
}

interface MapClusterProps {
    properties: any[]
    onPropertySelect?: (property: any) => void
    onMarkerHover?: (property: any | null) => void
    zoom: number
    projection?: 'mercator' | 'globe'
}

/**
 * Creates property clusters based on zoom level
 * Returns either individual properties or clusters depending on proximity and zoom
 */
function createClusters(properties: any[], zoomLevel: number): (any | PropertyCluster)[] {
    if (!properties.length) return []

    // At high zoom, show individual properties
    if (zoomLevel > 10) {
        return properties
    }

    const clusterRadius = Math.max(0.1, 1 / Math.pow(2, zoomLevel - 5))
    const clusters: Map<string, PropertyCluster> = new Map()
    const clusteredIds: Set<string> = new Set()

    // Group nearby properties
    properties.forEach(property => {
        if (!property.latitude || !property.longitude) return

        let foundCluster = false
        for (const [key, cluster] of clusters) {
            const distance = Math.sqrt(
                Math.pow(property.latitude - cluster.latitude, 2) +
                Math.pow(property.longitude - cluster.longitude, 2)
            )

            if (distance < clusterRadius) {
                cluster.properties.push(property)
                cluster.count++
                const prices = cluster.properties
                    .filter((p: any) => p.rooms?.length)
                    .map((p: any) => Math.min(...p.rooms.map((r: any) => r.price_per_night)))
                cluster.averagePrice = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : undefined
                clusteredIds.add(property.id)
                foundCluster = true
                break
            }
        }

        if (!foundCluster) {
            const clusterKey = `${property.latitude.toFixed(4)}_${property.longitude.toFixed(4)}`
            clusters.set(clusterKey, {
                id: clusterKey,
                latitude: property.latitude,
                longitude: property.longitude,
                count: 1,
                properties: [property],
                zoom: zoomLevel,
                averagePrice: property.rooms?.length
                    ? Math.min(...property.rooms.map((r: any) => r.price_per_night))
                    : undefined
            })
        }
    })

    return Array.from(clusters.values()).map(cluster =>
        cluster.count === 1 ? cluster.properties[0] : cluster
    )
}

export function PropertyMarkerCluster({ 
    properties, 
    onPropertySelect, 
    onMarkerHover,
    zoom,
    projection = 'mercator'
}: MapClusterProps) {
    const { formatPrice } = useCurrency()
    const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null)

    const clusters = useMemo(() => {
        return createClusters(properties, zoom)
    }, [properties, zoom])

    return (
        <>
            {clusters.map((item) => {
                const isCluster = 'properties' in item && item.count > 1

                if (isCluster) {
                    return (
                        <div
                            key={item.id}
                            className="relative"
                            style={{
                                position: 'absolute',
                                left: `${((item.longitude + 180) / 360) * 100}%`,
                                top: `${((90 - item.latitude) / 180) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            onMouseEnter={() => setExpandedClusterId(item.id)}
                            onMouseLeave={() => setExpandedClusterId(null)}
                        >
                            <div className={cn(
                                "relative cursor-pointer transition-all duration-300",
                                expandedClusterId === item.id ? "scale-125 z-50" : "scale-100 z-10"
                            )}>
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center font-black text-white shadow-xl transition-all duration-300",
                                    expandedClusterId === item.id
                                        ? "bg-[#0B3D6F] shadow-blue-500/50 ring-4 ring-white"
                                        : "bg-[#F17720] shadow-orange-500/50 ring-2 ring-white hover:ring-4"
                                )}>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm">{item.count}</span>
                                        <span className="text-[10px] opacity-75">stays</span>
                                    </div>
                                </div>

                                {/* Expanded cluster popup */}
                                {expandedClusterId === item.id && (
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 w-max z-[100] border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="text-xs font-bold text-slate-700 mb-2 text-center">
                                            {item.count} properties in this area
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            {item.properties.slice(0, 4).map((prop: any) => (
                                                <button
                                                    key={prop.id}
                                                    onClick={() => onPropertySelect?.(prop)}
                                                    className="px-2 py-1 bg-slate-50 hover:bg-[#F17720] hover:text-white rounded-lg text-[10px] font-semibold transition-colors text-slate-600"
                                                >
                                                    {prop.title?.substring(0, 12)}...
                                                </button>
                                            ))}
                                            {item.count > 4 && (
                                                <div className="col-span-2 text-center text-[10px] text-slate-400 font-bold py-1">
                                                    +{item.count - 4} more
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-white border-r border-b border-slate-100 rotate-45" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                } else {
                    const property = item
                    const minPrice = property.rooms?.length
                        ? Math.min(...property.rooms.map((r: any) => r.price_per_night))
                        : null

                    return (
                        <div
                            key={property.id}
                            className="relative"
                            style={{
                                position: 'absolute',
                                left: `${((property.longitude + 180) / 360) * 100}%`,
                                top: `${((90 - property.latitude) / 180) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            onMouseEnter={() => onMarkerHover?.(property)}
                            onMouseLeave={() => onMarkerHover?.(null)}
                            onClick={() => onPropertySelect?.(property)}
                        >
                            <div className={cn(
                                "px-3 py-1.5 rounded-2xl font-black text-sm shadow-lg border-2 transition-all duration-300 cursor-pointer whitespace-nowrap",
                                "bg-white text-[#0B3D6F] border-slate-100 hover:border-[#F17720] hover:text-[#F17720]"
                            )}>
                                {minPrice ? formatPrice(minPrice) : "TBD"}
                            </div>
                            <div className="w-2 h-2 rotate-45 mx-auto -mt-1 bg-white border-r-2 border-b-2 border-slate-100" />
                        </div>
                    )
                }
            })}
        </>
    )
}

/**
 * Map property info card shown in search results
 */
export function MapPropertyCard({ property, onClose }: { property: any; onClose: () => void }) {
    const { formatPrice } = useCurrency()
    const minPrice = property.rooms?.length
        ? Math.min(...property.rooms.map((r: any) => r.price_per_night))
        : null

    return (
        <div className="w-full max-w-xs rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-shadow">
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                {property.main_image_url ? (
                    <img
                        src={property.main_image_url}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Home className="w-8 h-8 opacity-50" />
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
                >
                    ✕
                </button>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 line-clamp-2 text-sm">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#F17720]" />
                        {property.city}, {property.governorate}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-black text-[#0B3D6F]">
                            {minPrice ? formatPrice(minPrice) : 'TBD'}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">/night</span>
                    </div>
                    <a
                        href={`/properties/${property.id}`}
                        className="px-4 py-2 bg-[#0B3D6F] text-white text-xs font-black rounded-lg hover:bg-[#F17720] transition-colors"
                    >
                        View
                    </a>
                </div>
            </div>
        </div>
    )
}
