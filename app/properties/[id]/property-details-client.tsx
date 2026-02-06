'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { BookingSection } from "@/components/booking/booking-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PropertyHeaderActions } from "@/components/properties/property-header-actions"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from '@/components/providers/language-provider'
import {
    Star, MapPin, CheckCircle2, ShieldCheck, Mail,
    Wifi, Car, Tv, Utensils, Wind, Monitor, Coffee,
    Waves, Key
} from 'lucide-react'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { updatePropertyLocation } from '@/app/actions/properties'
import { MapPicker } from '@/components/ui/map-picker'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PropertyDetailsClientProps {
    property: any
    user: any
    propertySpecs: any
    propertyRooms: any[]
    ownerProfile: any
    isFavorited: boolean
    reviews: any[]
    ratingInfo: any
}

import { useRouter } from 'next/navigation'
import { PropertyReviews } from '@/components/properties/property-reviews'

export function PropertyDetailsClient({ property, user, propertySpecs, propertyRooms, ownerProfile, isFavorited, reviews, ratingInfo }: PropertyDetailsClientProps) {
    const { t } = useLanguage()
    const router = useRouter()

    // Safety check: track view
    React.useEffect(() => {
        if (user?.id !== property.owner_id) {
            import('@/app/actions/properties').then(m => m.trackPropertyView(property.id, user?.id))
        }
    }, [property.id, user?.id, property.owner_id])

    // Ownership check
    const isOwner = user?.id === property.owner_id

    // Location State
    const [isEditingLocation, setIsEditingLocation] = useState(false)
    const [location, setLocation] = useState<{ lat?: number; lng?: number }>({
        lat: property.latitude,
        lng: property.longitude
    })

    const handleUpdateLocation = async () => {
        if (!location.lat || !location.lng) {
            toast.error("Please select a location on the map")
            return
        }

        const res = await updatePropertyLocation(property.id, location.lat, location.lng)

        if (res.success) {
            toast.success("Location updated successfully")
            setIsEditingLocation(false)
            router.refresh()
        } else {
            toast.error("Failed to update location")
        }
    }

    // Helper to get amenities icon
    const getAmenityIcon = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('wifi') || lowerName.includes('internet')) return <Wifi className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('parking') || lowerName.includes('voiture')) return <Car className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('tv') || lowerName.includes('télé')) return <Tv className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('kitchen') || lowerName.includes('cuisine')) return <Utensils className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('ac') || lowerName.includes('air') || lowerName.includes('clima')) return <Wind className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('workspace') || lowerName.includes('bureau')) return <Monitor className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('pool') || lowerName.includes('piscine')) return <Waves className="w-5 h-5 text-gray-600" />
        if (lowerName.includes('breakfast') || lowerName.includes('déjeuner')) return <Coffee className="w-5 h-5 text-gray-600" />

        return <CheckCircle2 className="w-5 h-5 text-[#0B3D6F]" />
    }

    // Safely parse amenities
    const amenities = Array.isArray(property.amenities) ? property.amenities : []

    // Calculate dynamic values
    const maxGuests = propertyRooms.length > 0
        ? Math.max(...propertyRooms.map(r => r.max_guests))
        : 0
    const minBeds = propertyRooms.length > 0
        ? propertyRooms.reduce((acc, r) => acc + (r.beds || 1), 0)
        : 1

    // Highlights (Mocked for now based on typical features)
    const highlights = [
        { icon: <Key className="w-6 h-6" />, title: "Easy Check-in", desc: "Seamless arrival experience." },
        { icon: <MapPin className="w-6 h-6" />, title: "Prime Location", desc: `Situated in the heart of ${property.city}, close to amenities.` },
        { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure payment", desc: "Your payment information is processed securely." }
    ]

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
                <div className="container flex h-20 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
                    <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-[#0B3D6F] flex items-center gap-2 transition-colors px-3 py-2 rounded-full hover:bg-slate-50">
                        &larr;
                        {t.property.backToSearch}
                    </Link>
                    <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
                        <div className="relative h-10 md:h-12 w-auto">
                            <img
                                src="/images/logo_darlink.png"
                                alt="DARLINK Logo"
                                className="h-full w-auto object-contain drop-shadow-md"
                            />
                        </div>
                        <div className="hidden sm:flex flex-col justify-center -space-y-1">
                            <div className="leading-none flex items-baseline">
                                <span className="font-extrabold text-2xl tracking-tight text-[#0B3D6F]">DAR</span>
                                <span className="font-bold text-2xl tracking-tight text-[#F17720]">LINK</span>
                                <span className="text-sm font-medium ml-0.5 opacity-60 text-[#0B3D6F]">.tn</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80 hidden lg:block text-slate-500">
                                Authentic Tunisian Stays
                            </span>
                        </div>
                    </Link>
                    <div className="flex gap-2">
                        <PropertyHeaderActions
                            propertyId={property.id}
                            userId={user?.id}
                            isFavorited={isFavorited}
                        />
                    </div>
                </div>
            </header>

            <main className="container px-4 md:px-6 py-8 mx-auto max-w-7xl">

                {/* Title & Meta */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B3D6F] tracking-tight leading-[1.1] mb-4">
                        {property.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5 underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-[#0B3D6F]">
                                <MapPin className="w-4 h-4 text-[#F17720]" />
                                {property.city}, {property.governorate}
                            </span>

                            <span className="hidden sm:inline text-slate-300">|</span>

                            <span className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-[#F17720] fill-[#F17720]" />
                                <strong>New</strong>
                                <span className="text-slate-500">(0 reviews)</span>
                            </span>

                            <span className="hidden sm:inline text-slate-300">|</span>

                            <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold">
                                    {property.type}
                                </Badge>
                                <Badge variant="outline" className="text-[#F17720] border-[#F17720] bg-orange-50/50">
                                    {t.property.newListing}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {/* Dynamic Image Grid */}
                <div className="h-[45vh] md:h-[60vh] min-h-[400px] mb-12 rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/5">
                    {/* Case 1: Only Main Image */}
                    {(!property.property_images || property.property_images.length === 0) && (
                        <div className="w-full h-full relative group cursor-pointer">
                            <img
                                src={property.main_image_url || '/placeholder.jpg'}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                    )}

                    {/* Case 2: Main + 1 Image */}
                    {property.property_images?.length === 1 && (
                        <div className="grid grid-cols-2 gap-2 h-full">
                            <div className="relative group cursor-pointer overflow-hidden">
                                <img src={property.main_image_url || '/placeholder.jpg'} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="relative group cursor-pointer overflow-hidden">
                                <img src={property.property_images[0].image_url} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                    )}

                    {/* Case 3: Main + 2 Images (1 Left, 2 Right stacked) */}
                    {property.property_images?.length === 2 && (
                        <div className="grid grid-cols-3 gap-2 h-full">
                            <div className="col-span-2 relative group cursor-pointer overflow-hidden">
                                <img src={property.main_image_url || '/placeholder.jpg'} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="col-span-1 grid grid-rows-2 gap-2">
                                {property.property_images.map((img: any, idx: number) => (
                                    <div key={idx} className="relative group cursor-pointer overflow-hidden h-full">
                                        <img src={img.image_url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Case 4: Main + 3 Images (1 Left, 1 Top Right, 2 Bottom Right) */}
                    {property.property_images?.length === 3 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-full">
                            <div className="md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
                                <img src={property.main_image_url || '/placeholder.jpg'} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="md:col-span-2 h-full relative group cursor-pointer overflow-hidden">
                                <img src={property.property_images[0].image_url} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            {property.property_images.slice(1).map((img: any, idx: number) => (
                                <div key={idx} className="h-full relative group cursor-pointer overflow-hidden">
                                    <img src={img.image_url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Case 5: Main + 4 or more Images (Standard Bento) */}
                    {property.property_images?.length >= 4 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
                            <div className="md:col-span-2 h-full relative group cursor-pointer bg-slate-100">
                                <img
                                    src={property.main_image_url || '/placeholder.jpg'}
                                    alt={property.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
                                {property.property_images.slice(0, 4).map((img: any, idx: number) => (
                                    <div key={idx} className="relative group cursor-pointer overflow-hidden h-full bg-slate-100">
                                        <img
                                            src={img.image_url}
                                            alt={`Gallery ${idx}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

                                        {/* Overlay for "View All" on the last image if there are more */}
                                        {idx === 3 && property.property_images.length > 4 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px] transition-opacity hover:bg-black/50">
                                                +{property.property_images.length - 4} photos
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Host Header */}
                        <div className="flex items-center justify-between pb-8 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-1">
                                    {t.property.hostedBy} {ownerProfile?.full_name || 'Host'}
                                </h2>
                                <p className="text-slate-500">
                                    {maxGuests} {t.booking.guests} · {propertyRooms.length} {propertyRooms.length === 1 ? 'bedroom' : 'bedrooms'} · {minBeds} beds
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-full p-1 border border-gray-200 shadow-sm">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={ownerProfile?.avatar_url} className="object-cover" />
                                    <AvatarFallback className="bg-[#0B3D6F] text-white font-bold text-xl">
                                        {ownerProfile?.full_name?.[0] || 'H'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-6">
                            {highlights.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="mt-1 text-slate-700">{item.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="bg-gray-100" />

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-[#0B3D6F] mb-4">{t.property.about}</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-8 whitespace-pre-line text-lg">
                                {property.description}
                            </div>
                        </div>

                        <Separator className="bg-gray-100" />

                        {/* Amenities */}
                        <div>
                            <h3 className="text-2xl font-bold text-[#0B3D6F] mb-6">{t.property.offers}</h3>
                            {amenities.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    {amenities.map((amenity: any, idx: number) => {
                                        const name = amenity.name || amenity
                                        return (
                                            <div key={idx} className="flex items-center gap-3 pb-2 border-b border-gray-50 last:border-0 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                                {getAmenityIcon(name)}
                                                <span className="text-slate-700">{name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic">{t.property.noAmenities}</p>
                                </div>
                            )}
                        </div>


                        {/* Location / Map Section */}
                        <div className="py-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#0B3D6F]">{t.property.location || "Where you'll be"}</h2>
                                {isOwner && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingLocation(!isEditingLocation)}
                                        className="text-[#F17720] border-[#F17720] hover:bg-orange-50"
                                    >
                                        {isEditingLocation ? 'Cancel' : (property.latitude ? 'Edit Location' : 'Add Location')}
                                    </Button>
                                )}
                            </div>

                            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-slate-50 shadow-sm">
                                {(property.latitude && property.longitude && !isEditingLocation) ? (
                                    <Map
                                        initialViewState={{
                                            latitude: property.latitude,
                                            longitude: property.longitude,
                                            zoom: 13
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        mapStyle="mapbox://styles/mapbox/streets-v12"
                                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                                    >
                                        <Marker longitude={property.longitude} latitude={property.latitude} anchor="bottom">
                                            <div className="bg-white p-2 rounded-full shadow-lg">
                                                <MapPin className="w-8 h-8 text-[#F17720] fill-[#F17720]" />
                                            </div>
                                        </Marker>
                                    </Map>
                                ) : (
                                    (isEditingLocation || (!property.latitude && isOwner)) ? (
                                        <div className="relative h-full w-full">
                                            <MapPicker
                                                latitude={location.lat}
                                                longitude={location.lng}
                                                onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                                                height="100%"
                                            />
                                            {isEditingLocation && (
                                                <div className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-xl border shadow-lg backdrop-blur-sm">
                                                    <p className="text-xs font-bold text-slate-600 mb-2 px-1">Adjust pin to exact location</p>
                                                    <Button onClick={handleUpdateLocation} size="sm" className="w-full bg-[#0B3D6F] text-white hover:bg-[#092d52]">
                                                        Save Location
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50">
                                            <MapPin className="w-12 h-12 mb-2 opacity-20" />
                                            <p>Location information not available</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <PropertyReviews
                            propertyId={property.id}
                            reviews={reviews}
                            ratingInfo={ratingInfo}
                            userId={user?.id}
                        />

                        <Separator className="bg-gray-100" />

                    </div>

                    {/* RIGHT COLUMN - Sticky Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="relative">
                                {/* Decorative blur behind card */}
                                <div className="absolute -inset-1 bg-gradient-to-b from-blue-100 to-orange-50 rounded-[2rem] blur-xl opacity-50" />

                                <div className="relative">
                                    <BookingSection
                                        propertyId={property.id}
                                        rooms={propertyRooms}
                                        propertyType={property.type}
                                    />
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-green-50 rounded-full text-green-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 mb-0.5">{t.property.identityVerified}</p>
                                    <p className="text-sm text-gray-500 leading-snug">
                                        This host has completed our identity verification process.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center pt-2">
                                <Link href="#" className="text-xs text-slate-400 hover:underline">
                                    Report this listing
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
