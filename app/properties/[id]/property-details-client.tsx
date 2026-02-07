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
    Waves, Key, Share, Heart, ChevronLeft, ChevronRight, Navigation, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { updatePropertyLocation, trackPropertyView } from '@/app/actions/properties'
import { MapPicker } from '@/components/ui/map-picker'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PropertyReviews } from '@/components/properties/property-reviews'
import { useCurrency } from '@/components/providers/currency-provider'
import { Calendar } from '@/components/ui/calendar'
import { PropertyGallery } from '@/components/properties/property-gallery'

interface PropertyDetailsClientProps {
    property: any
    user: any
    propertySpecs: any
    propertyRooms: any[]
    propertyAmenities: any[]
    ownerProfile: any
    isFavorited: boolean
    reviews: any[]
    ratingInfo: any
    canReview?: boolean
}

export function PropertyDetailsClient({
    property,
    user,
    propertySpecs,
    propertyRooms,
    propertyAmenities,
    ownerProfile,
    isFavorited,
    reviews,
    ratingInfo,
    canReview
}: PropertyDetailsClientProps) {
    const { t } = useLanguage()
    const { formatPrice } = useCurrency()
    const router = useRouter()

    // Safety check: track view
    React.useEffect(() => {
        if (user?.id !== property.owner_id) {
            trackPropertyView(property.id, user?.id)
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
    const amenities = propertyAmenities.map((am: any) => am.amenity)

    // Booking State (Lifted for shareability)
    const [selectedRoomId, setSelectedRoomId] = useState<string>(propertyRooms[0]?.id || '')
    const [date, setDate] = useState<DateRange | undefined>()
    const [disabledDates, setDisabledDates] = useState<Date[]>([])

    const selectedRoom = propertyRooms.find(r => r.id === selectedRoomId)
    const unitsAvailable = selectedRoom?.units_count || 1

    // Fetch availability
    React.useEffect(() => {
        if (!selectedRoomId) return
        const supabase = createClient()

        const fetchBlockedDates = async () => {
            const { data } = await supabase
                .from('bookings')
                .select('start_date, end_date, units_booked')
                .eq('room_id', selectedRoomId)
                .neq('status', 'cancelled')
                .gte('end_date', new Date().toISOString())

            if (data) {
                const dateMap: Record<string, number> = {}
                data.forEach((booking: any) => {
                    let curr = parseISO(booking.start_date)
                    const end = parseISO(booking.end_date)
                    const ub = booking.units_booked || 1

                    while (curr < end) {
                        const dStr = format(curr, 'yyyy-MM-dd')
                        dateMap[dStr] = (dateMap[dStr] || 0) + ub
                        curr = addDays(curr, 1)
                    }
                })

                const blocked: Date[] = []
                Object.entries(dateMap).forEach(([dStr, count]) => {
                    if (count >= unitsAvailable) {
                        blocked.push(parseISO(dStr))
                    }
                })
                setDisabledDates(blocked)
            }
        }

        fetchBlockedDates()
    }, [selectedRoomId, unitsAvailable])

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

                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const prices = propertyRooms?.map(r => Number(r.price_per_night)) || []
                                    if (prices.length === 0) return null

                                    const minPrice = Math.min(...prices)
                                    const maxPrice = Math.max(...prices)

                                    return (
                                        <span className="text-[#0B3D6F] font-black underline decoration-[#F17720] decoration-2 underline-offset-4">
                                            {minPrice === maxPrice
                                                ? formatPrice(minPrice)
                                                : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                                            }
                                            <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/night</span>
                                        </span>
                                    )
                                })()}
                            </div>

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

                {/* Gallery component replacement */}
                <PropertyGallery
                    mainImageUrl={property.main_image_url}
                    images={property.property_images || []}
                    title={property.title}
                />

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
                                        return (
                                            <div key={idx} className="flex items-center gap-3 pb-2 border-b border-gray-50 last:border-0 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                                {getAmenityIcon(amenity)}
                                                <span className="text-slate-700">{amenity}</span>
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

                        <Separator className="bg-gray-100" />

                        {/* Availability & Selection */}
                        <div id="availability" className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#0B3D6F] mb-2">Availability & Room Selection</h2>
                                <p className="text-slate-500">Choose your room and see available dates for your stay.</p>
                            </div>

                            {propertyRooms.length > 1 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {propertyRooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => setSelectedRoomId(room.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 text-left transition-all",
                                                selectedRoomId === room.id
                                                    ? "border-[#F17720] bg-orange-50/50"
                                                    : "border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            <h4 className="font-bold text-[#0B3D6F] truncate">{room.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{formatPrice(room.price_per_night)} / night</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-[2rem] p-6 lg:p-10 flex flex-col items-center">
                                <Calendar
                                    mode="range"
                                    numberOfMonths={2}
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={[
                                        { before: new Date() },
                                        ...disabledDates
                                    ]}
                                    className="rounded-3xl border-0 shadow-sm bg-white p-6"
                                />

                                <div className="mt-8 flex flex-wrap gap-6 justify-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-md border-2 border-slate-200 bg-white" />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-md bg-slate-100" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-slate-400">Booked</span>
                                    </div>
                                    {date?.from && date?.to ? (
                                        <div className="flex items-center gap-2 text-green-600 animate-in zoom-in-95">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="text-xs font-black uppercase tracking-widest">Dates Selected</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[#F17720]">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="text-xs font-black uppercase tracking-widest">Select your dates</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-gray-100" />
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
                        {/* Reviews Section */}
                        <PropertyReviews
                            propertyId={property.id}
                            reviews={reviews}
                            ratingInfo={ratingInfo}
                            userId={user?.id}
                            canReview={canReview}
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
                                        selectedRoomId={selectedRoomId}
                                        setSelectedRoomId={setSelectedRoomId}
                                        date={date}
                                        setDate={setDate}
                                        disabledDates={disabledDates}
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
