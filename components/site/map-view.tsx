'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, X, Star, Heart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/components/providers/currency-provider'

interface MapViewProps {
    properties: any[]
    onBoundsChange?: (bounds: { sw: [number, number], ne: [number, number] } | null) => void
    projection?: 'mercator' | 'globe'
}

const TUNISIA_CENTER = {
    latitude: 33.8869, // Slightly more central for globe view
    longitude: 9.5375,
    zoom: 5.5 // Better zoomed out for globe
}

export const MapView = React.memo(function MapView({ properties, onBoundsChange, projection = 'mercator' }: MapViewProps) {
    const [popupInfo, setPopupInfo] = useState<any>(null)
    const [hoveredPopup, setHoveredPopup] = useState<any>(null)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const [viewState, setViewState] = useState({
        ...TUNISIA_CENTER,
        zoom: projection === 'globe' ? 5.5 : 6 // Show all of Tunisia on start
    })

    const { formatPrice } = useCurrency()
    const activePopup = hoveredPopup || popupInfo;
    const prevBoundsRef = React.useRef<string>('')

    const updateBounds = React.useCallback((map: any) => {
        if (!onBoundsChange) return

        try {
            const bounds = map.getBounds()
            const sw = bounds.getWest()
            const s = bounds.getSouth()
            const ne = bounds.getEast()
            const n = bounds.getNorth()

            // Increase precision slightly but keep it stable
            const boundsKey = `${sw.toFixed(5)},${s.toFixed(5)},${ne.toFixed(5)},${n.toFixed(5)}`

            if (prevBoundsRef.current !== boundsKey) {
                prevBoundsRef.current = boundsKey

                // Use requestAnimationFrame to detach from the current render/event cycle
                // this prevents "Maximum call stack size exceeded" by breaking the synchronous chain
                requestAnimationFrame(() => {
                    onBoundsChange({
                        sw: [sw, s],
                        ne: [ne, n]
                    })
                })
            }
        } catch (e) {
            console.warn("Map bounds update failed:", e)
        }
    }, [onBoundsChange])

    const handleMapReady = React.useCallback((evt: any) => {
        const map = evt.target;

        if (projection === 'globe') {
            map.setFog({
                'range': [0.5, 10],
                'color': '#ffffff',
                'high-color': '#0B3D6F',
                'space-color': '#0B3D6F',
                'horizon-blend': 0.15
            });
        }

        updateBounds(map)
    }, [projection, updateBounds])

    const handleMoveEnd = React.useCallback((evt: any) => {
        updateBounds(evt.target)
    }, [updateBounds])

    const handleMove = React.useCallback((evt: any) => {
        setViewState(evt.viewState)
    }, [])

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    // Filter properties that have valid coordinates
    const validProperties = useMemo(() => {
        return properties.filter(p => p.latitude && p.longitude)
    }, [properties])

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center bg-slate-50 rounded-3xl text-red-500 p-4 h-[700px] border border-red-100 font-bold">
                Map configuration missing.
            </div>
        )
    }

    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-white/20 relative group/map bg-slate-100">
            <Map
                {...viewState}
                onMove={handleMove}
                onMoveEnd={handleMoveEnd}
                onLoad={handleMapReady}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                projection={projection}
                reuseMaps
            >
                <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <NavigationControl position="top-right" showCompass={false} />
                    <FullscreenControl position="top-right" />
                </div>

                {validProperties.map((property) => {
                    const minPrice = property.rooms && property.rooms.length > 0
                        ? Math.min(...property.rooms.map((r: any) => r.price_per_night))
                        : null;

                    const isHovered = hoveredId === property.id;
                    const isActive = activePopup?.id === property.id;
                    const isFixed = popupInfo?.id === property.id;

                    return (
                        <Marker
                            key={property.id}
                            longitude={property.longitude}
                            latitude={property.latitude}
                            anchor="center"
                            onClick={(e: any) => {
                                e.originalEvent.stopPropagation()
                                // If already fixed, clicking again doesn't hurt, but if different, we fix the new one
                                setPopupInfo(property)
                            }}
                        >
                            <div
                                onMouseEnter={() => {
                                    setHoveredId(property.id)
                                    setHoveredPopup(property)
                                }}
                                onMouseLeave={() => {
                                    setHoveredId(null)
                                    setHoveredPopup(null)
                                }}
                                className={cn(
                                    "transition-all duration-300 transform cursor-pointer",
                                    (isHovered || isActive) ? "scale-110 z-50" : "scale-100 z-10"
                                )}
                            >
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl font-black text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 transition-all duration-500 flex items-center gap-1.5 backdrop-blur-sm",
                                    (isHovered || isActive)
                                        ? (isFixed ? "bg-[#0B3D6F] text-white border-white scale-110 shadow-blue-500/40" : "bg-[#F17720] text-white border-white scale-110 shadow-orange-500/40")
                                        : "bg-white text-[#0B3D6F] border-slate-50 hover:border-[#F17720] hover:text-[#F17720]"
                                )}>
                                    {minPrice ? formatPrice(minPrice) : "TBD"}
                                </div>
                                {/* Little beak */}
                                <div className={cn(
                                    "w-3 h-3 rotate-45 mx-auto -mt-1.5 border-r-2 border-b-2 transition-all duration-500",
                                    (isHovered || isActive)
                                        ? (isFixed ? "bg-[#0B3D6F] border-white" : "bg-[#F17720] border-white")
                                        : "bg-white border-slate-50"
                                )} />
                            </div>
                        </Marker>
                    )
                })}

                {activePopup && (
                    <Popup
                        anchor="top"
                        longitude={activePopup.longitude}
                        latitude={activePopup.latitude}
                        onClose={() => {
                            // Only clicking the X or close should clear the "Fixed" popup
                            if (!hoveredPopup) setPopupInfo(null)
                        }}
                        closeButton={false}
                        className="property-popup z-[100] pointer-events-none"
                        maxWidth="320px"
                        focusAfterOpen={false}
                    >
                        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.05] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500 pointer-events-auto">
                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                                <img
                                    src={activePopup.main_image_url || '/placeholder.jpg'}
                                    alt={activePopup.title}
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                <div className="absolute top-4 left-4 flex gap-2">
                                    <Badge className="bg-[#F17720] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-lg">
                                        {activePopup.type}
                                    </Badge>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setPopupInfo(null); setHoveredPopup(null); }}
                                    className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 flex items-center justify-center transition-all border border-white/20 shadow-xl"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                                    <p className="font-bold text-base tracking-tight drop-shadow-md line-clamp-1 flex-1 mr-2">{activePopup.title}</p>
                                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[11px] font-black tracking-tighter">NEW</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-white space-y-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin className="w-4 h-4 text-[#F17720]" />
                                    <span className="text-xs font-bold leading-none tracking-tight">{activePopup.city}, {activePopup.governorate}</span>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-[#0B3D6F] leading-none tracking-tighter">
                                            {activePopup.rooms && activePopup.rooms.length > 0
                                                ? formatPrice(Math.min(...activePopup.rooms.map((r: any) => r.price_per_night)))
                                                : 'TBD'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Per night</span>
                                    </div>

                                    <Link
                                        href={`/properties/${activePopup.id}`}
                                        className="h-11 px-6 rounded-2xl bg-[#0B3D6F] text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#F17720] hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-blue-900/10 active:scale-95"
                                    >
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Custom overlay styling for popups via CSS injection or global CSS */}
            <style jsx global>{`
                .property-popup .mapboxgl-popup-content {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    border-radius: 1.5rem !important;
                }
                .property-popup .mapboxgl-popup-tip {
                    display: none;
                }
                ${projection === 'globe' ? `
                .mapboxgl-canvas {
                    cursor: grab !important;
                }
                ` : ''}
            `}</style>
        </div>
    )
})

