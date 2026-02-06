'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, MapMouseEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface MapPickerProps {
    latitude?: number
    longitude?: number
    onLocationSelect: (lat: number, lng: number) => void
    height?: string
    zoom?: number
}

const TUNISIA_CENTER = {
    latitude: 33.8869,
    longitude: 9.5375,
    zoom: 6
}

export function MapPicker({ latitude, longitude, onLocationSelect, height = "400px", zoom = 10 }: MapPickerProps) {
    const [viewState, setViewState] = useState({
        latitude: latitude || TUNISIA_CENTER.latitude,
        longitude: longitude || TUNISIA_CENTER.longitude,
        zoom: latitude ? zoom : TUNISIA_CENTER.zoom
    })

    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    )

    // Update internal state if props change
    useEffect(() => {
        if (latitude && longitude) {
            setMarker({ lat: latitude, lng: longitude })
            setViewState(prev => ({
                ...prev,
                latitude,
                longitude,
                zoom: 12 // specific zoom when location is known
            }))
        }
    }, [latitude, longitude])

    const handleMapClick = useCallback((event: MapMouseEvent) => {
        const { lat, lng } = event.lngLat
        setMarker({ lat, lng })
        onLocationSelect(lat, lng)
    }, [onLocationSelect])

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg text-red-500 p-4 h-full border border-red-200">
                Error: Mapbox token not found. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.
            </div>
        )
    }

    return (
        <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', position: 'relative' }}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                onClick={handleMapClick}
                cursor="crosshair"
            >
                <GeolocateControl position="top-left" />
                <FullscreenControl position="top-right" />
                <NavigationControl position="bottom-right" />

                {marker && (
                    <Marker
                        latitude={marker.lat}
                        longitude={marker.lng}
                        anchor="bottom"
                        draggable
                        onDragEnd={(evt: any) => {
                            const { lat, lng } = evt.lngLat
                            setMarker({ lat, lng })
                            onLocationSelect(lat, lng)
                        }}
                    >
                        <MapPin className="w-8 h-8 text-[#F17720] fill-white drop-shadow-md animate-bounce" />
                    </Marker>
                )}
            </Map>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 pointer-events-none">
                Click on the map to pin exact location
            </div>
        </div>
    )
}
