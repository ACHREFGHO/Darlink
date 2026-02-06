'use client'

import React, { useState, useMemo } from 'react'
import { Navbar } from '@/components/site/navbar'
import { MapView } from '@/components/site/map-view'
import { PropertyCardListing } from '@/components/properties/property-card-listing'
import { useLanguage } from '@/components/providers/language-provider'
import { useCurrency } from '@/components/providers/currency-provider'
import {
    Search,
    SlidersHorizontal,
    LayoutGrid,
    Map as MapIcon,
    X,
    ChevronDown,
    Home,
    Building2,
    Tent,
    Users,
    PartyPopper,
    Briefcase,
    Wifi,
    Car,
    Wind,
    Coffee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface SearchClientProps {
    properties: any[]
    user: any
    userRole: string
    favoriteIds: string[]
}

const CATEGORIES = [
    { id: 'all', label: 'All Stays', icon: Home },
    { id: 'Family', label: 'Family', icon: Users },
    { id: 'Friends', label: 'Friends', icon: PartyPopper },
    { id: 'Company', label: 'Business', icon: Briefcase },
    { id: 'House', label: 'Houses', icon: Building2 },
    { id: 'Apartment', label: 'Apartments', icon: LayoutGrid },
    { id: 'Guesthouse', label: 'Guesthouses', icon: Tent },
]

const AMENITIES = [
    { id: 'wifi', label: 'Fast Wi-Fi', icon: Wifi },
    { id: 'parking', label: 'Free Parking', icon: Car },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'kitchen', label: 'Kitchen', icon: Coffee },
]

export function SearchClient({ properties, user, userRole, favoriteIds }: SearchClientProps) {
    const { t } = useLanguage()
    const { formatPrice } = useCurrency()

    // States
    const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split')
    const [activeCategory, setActiveCategory] = useState('all')
    const [priceRange, setPriceRange] = useState([0, 2000])
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating-desc'>('recommended')
    const [mapBounds, _setMapBounds] = useState<{ sw: [number, number], ne: [number, number] } | null>(null)
    const setMapBounds = React.useCallback((bounds: { sw: [number, number], ne: [number, number] } | null) => {
        _setMapBounds(bounds)
    }, [])

    // Filtering & Sorting Logic
    const filteredProperties = useMemo(() => {
        let result = properties.filter(p => {
            // Category Filter (Matches type OR property_specs)
            if (activeCategory !== 'all') {
                const hasTypeMatch = p.type === activeCategory
                const hasSpecMatch = p.property_specs?.some((s: any) => s.category === activeCategory)

                if (!hasTypeMatch && !hasSpecMatch) return false
            }

            // Search Query
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                const matchesTitle = p.title?.toLowerCase().includes(q)
                const matchesCity = p.city?.toLowerCase().includes(q)
                const matchesGov = p.governorate?.toLowerCase().includes(q)
                if (!matchesTitle && !matchesCity && !matchesGov) return false
            }

            // Price Range (roughly checking rooms)
            const prices = p.rooms?.map((r: any) => r.price_per_night) || []
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0
            if (minPrice < priceRange[0] || minPrice > priceRange[1]) return false

            // Map Bounds
            if (viewMode !== 'list' && mapBounds) {
                if (!p.latitude || !p.longitude) return false
                const isWithinLat = p.latitude >= mapBounds.sw[1] && p.latitude <= mapBounds.ne[1]
                const isWithinLng = p.longitude >= mapBounds.sw[0] && p.longitude <= mapBounds.ne[0]
                if (!isWithinLat || !isWithinLng) return false
            }

            return true
        })

        // Sorting
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            result.sort((a, b) => {
                const aPrices = a.rooms?.map((r: any) => r.price_per_night) || []
                const bPrices = b.rooms?.map((r: any) => r.price_per_night) || []
                const aMin = aPrices.length > 0 ? Math.min(...aPrices) : 0
                const bMin = bPrices.length > 0 ? Math.min(...bPrices) : 0

                return sortBy === 'price-asc' ? aMin - bMin : bMin - aMin
            })
        } else if (sortBy === 'rating-desc') {
            result.sort((a, b) => {
                const aRatings = a.reviews?.map((r: any) => r.rating) || []
                const bRatings = b.reviews?.map((r: any) => r.rating) || []
                const aAvg = aRatings.length > 0 ? aRatings.reduce((sum: number, r: number) => sum + r, 0) / aRatings.length : 0
                const bAvg = bRatings.length > 0 ? bRatings.reduce((sum: number, r: number) => sum + r, 0) / bRatings.length : 0
                return bAvg - aAvg
            })
        }

        return result
    }, [properties, activeCategory, searchQuery, priceRange, mapBounds, viewMode, sortBy])

    // Calculate active region for dynamic header title
    const activeRegion = useMemo(() => {
        if (filteredProperties.length === 0) return null

        const cities = new Set(filteredProperties.map(p => p.city).filter(Boolean))
        const governorates = new Set(filteredProperties.map(p => p.governorate).filter(Boolean))

        // If one city is visible, use it. Otherwise if one governorate is visible, use that.
        if (cities.size === 1) return Array.from(cities)[0]
        if (governorates.size === 1) return Array.from(governorates)[0]

        return null
    }, [filteredProperties])

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col h-screen overflow-hidden relative">
            {/* Subtle Texture/Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[0] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <Navbar user={user} userRole={userRole} variant="inner" />

            {/* Filter Sub-header - Ultra Polished & Sticky */}
            <div className="border-b bg-white/70 backdrop-blur-3xl z-40 px-4 md:px-8 py-4 flex items-center justify-between gap-6 transition-all duration-500">
                {/* Horizontal Category Scroll with Fade Mask */}
                <div className="relative flex-1 group/scroll overflow-hidden">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon
                            const isActive = activeCategory === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 text-[13px] font-black uppercase tracking-[0.1em]",
                                        isActive
                                            ? "bg-[#0B3D6F] text-white shadow-[0_10px_25px_-5px_rgba(11,61,111,0.25)] ring-2 ring-[#0B3D6F]/10"
                                            : "bg-white text-slate-400 border border-slate-100 hover:border-[#F17720]/30 hover:text-[#F17720] hover:bg-orange-50/30"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-transform", isActive ? "text-orange-400 scale-110" : "text-slate-300 group-hover:scale-110")} />
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                    {/* Edge Fades for scroll indication */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/70 to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/70 to-transparent pointer-events-none opacity-100" />
                </div>

                {/* Advanced Filters Trigger */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 gap-3 font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-sm">
                            <SlidersHorizontal className="w-4 h-4 text-[#F17720]" />
                            Filters
                            <Badge variant="secondary" className="bg-orange-100 text-[#F17720] rounded-lg px-2 h-6 ml-1 font-black text-[10px]">
                                {selectedAmenities.length + (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0)}
                            </Badge>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-0 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl -mr-10 -mt-10" />
                        <DialogHeader className="relative">
                            <DialogTitle className="text-3xl font-black text-[#0B3D6F] tracking-tight">Refine Search</DialogTitle>
                            <p className="text-slate-400 text-sm font-semibold">Customize your perfect stay in Tunisia</p>
                        </DialogHeader>

                        <div className="py-8 space-y-10 relative">
                            {/* Price Range */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Price per night</h3>
                                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                        <span className="text-sm font-black text-[#F17720]">
                                            {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                                        </span>
                                    </div>
                                </div>
                                <Slider
                                    min={0}
                                    max={2000}
                                    step={50}
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    className="py-4"
                                />
                            </div>

                            {/* Amenities */}
                            <div className="space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Core Features</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {AMENITIES.map(amenity => (
                                        <div key={amenity.id} className="flex items-center space-x-3 group cursor-pointer">
                                            <Checkbox
                                                id={amenity.id}
                                                checked={selectedAmenities.includes(amenity.id)}
                                                onCheckedChange={(checked: boolean | string) => {
                                                    if (checked) setSelectedAmenities([...selectedAmenities, amenity.id])
                                                    else setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id))
                                                }}
                                                className="border-slate-200 data-[state=checked]:bg-[#0B3D6F] data-[state=checked]:border-[#0B3D6F] transition-all"
                                            />
                                            <label
                                                htmlFor={amenity.id}
                                                className="text-[13px] font-bold text-slate-500 group-hover:text-[#0B3D6F] cursor-pointer flex items-center gap-2.5 transition-colors"
                                            >
                                                <amenity.icon className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                {amenity.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t border-slate-50 gap-4 flex-row sm:justify-between items-center">
                            <Button
                                variant="ghost"
                                className="font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                                onClick={() => {
                                    setPriceRange([0, 2000])
                                    setSelectedAmenities([])
                                }}
                            >
                                Reset all
                            </Button>
                            <Button
                                className="bg-[#0B3D6F] hover:bg-[#F17720] text-white rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                            >
                                Apply Filters
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="h-8 w-px bg-gray-100 hidden md:block" />

                {/* Tactical View Switcher */}
                <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200/50 shadow-inner">
                    {[
                        { id: 'list', icon: LayoutGrid },
                        { id: 'split', icon: null, isSplit: true },
                        { id: 'map', icon: MapIcon }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as any)}
                            className={cn(
                                "p-2.5 rounded-[0.8rem] transition-all duration-300 relative group",
                                viewMode === mode.id
                                    ? "bg-white text-[#0B3D6F] shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-100"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            {mode.isSplit ? (
                                <div className="flex gap-1 items-center justify-center w-5 h-5">
                                    <div className={cn("w-1.5 h-4 rounded-sm transition-all", viewMode === 'split' ? "bg-[#0B3D6F]" : "bg-slate-300")} />
                                    <div className={cn("w-2.5 h-4 rounded-sm transition-all", viewMode === 'split' ? "bg-[#F17720]" : "bg-slate-300 opacity-60")} />
                                </div>
                            ) : mode.icon && (
                                <mode.icon className="w-5 h-5 stroke-[2.2px]" />
                            )}
                            {viewMode === mode.id && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F17720] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area - Split View Layout */}
            <div className="flex-1 relative flex overflow-hidden z-[1]">

                {/* LIST COLUMN */}
                <div className={cn(
                    "h-full overflow-y-auto custom-scrollbar transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white",
                    viewMode === 'list' ? "w-full" :
                        viewMode === 'map' ? "w-0 opacity-0 pointer-events-none" :
                            "w-full lg:w-[60%] xl:w-[55%]"
                )}>
                    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 px-4 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group/h1">
                                    <div className="h-0.5 w-12 bg-[#F17720] rounded-full transition-all group-hover/h1:w-20" />
                                    <span className="text-[10px] font-black text-[#F17720] uppercase tracking-[0.4em]">Tunisia Discovery</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-[#0B3D6F] tracking-tight leading-[0.9]">
                                    <span className="text-[#F17720] text-lg mb-4 block font-black uppercase tracking-widest">{filteredProperties.length} Stays Found</span>
                                    {activeRegion ? `Stays in ${activeRegion}` : 'Authentic Tunisia'}
                                </h1>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Sort & Organize</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="group flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-slate-100 bg-white text-[11px] font-black uppercase tracking-widest text-[#0B3D6F] hover:border-[#F17720]/30 hover:shadow-xl hover:shadow-orange-900/5 transition-all outline-none active:scale-95">
                                            <span className="text-slate-400 group-hover:text-[#F17720] transition-colors">{sortBy === 'recommended' ? 'Recommended' : 'Price Point'}</span>
                                            <div className="w-px h-4 bg-slate-100" />
                                            {sortBy === 'recommended' && 'Default View'}
                                            {sortBy === 'price-asc' && 'Lowest First'}
                                            {sortBy === 'price-desc' && 'Highest First'}
                                            {sortBy === 'rating-desc' && 'Top Rated'}
                                            <ChevronDown className="w-4 h-4 text-[#F17720] transition-transform group-data-[state=open]:rotate-180" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-[2rem] p-3 border-0 shadow-2xl bg-white/80 backdrop-blur-3xl min-w-[220px] mt-2">
                                        <DropdownMenuItem onClick={() => setSortBy('recommended')} className="rounded-xl font-black text-[10px] uppercase tracking-widest py-4 px-5 cursor-pointer focus:bg-[#0B3D6F] focus:text-white transition-all text-[#0B3D6F]">
                                            Recommended
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('rating-desc')} className="rounded-xl font-black text-[10px] uppercase tracking-widest py-4 px-5 cursor-pointer focus:bg-[#0B3D6F] focus:text-white transition-all text-[#0B3D6F]">
                                            Top Rated
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('price-asc')} className="rounded-xl font-black text-[10px] uppercase tracking-widest py-4 px-5 cursor-pointer focus:bg-[#0B3D6F] focus:text-white transition-all text-[#0B3D6F]">
                                            Price: Low to High
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('price-desc')} className="rounded-xl font-black text-[10px] uppercase tracking-widest py-4 px-5 cursor-pointer focus:bg-[#0B3D6F] focus:text-white transition-all text-[#0B3D6F]">
                                            Price: High to Low
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {filteredProperties.length > 0 ? (
                            <div className={cn(
                                "grid gap-8 pb-32 px-2",
                                viewMode === 'list'
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                    : "grid-cols-1 sm:grid-cols-2"
                            )}>
                                {filteredProperties.map((property, idx) => (
                                    <PropertyCardListing
                                        key={property.id}
                                        property={property}
                                        index={idx}
                                        isFavorited={favoriteIds.includes(property.id)}
                                        userId={user?.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4 relative">
                                <div className="bg-orange-50 w-32 h-32 rounded-full flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-[#F17720]/10 rounded-full animate-ping duration-[3s]" />
                                    <Search className="w-10 h-10 text-[#F17720] relative z-10" />
                                </div>
                                <h2 className="text-3xl font-black text-[#0B3D6F] mb-4">No results found</h2>
                                <p className="text-slate-400 max-w-sm font-semibold text-sm leading-relaxed mb-10">
                                    We couldn't find any stays matching your filters. Try clearing some options or exploring a different category.
                                </p>
                                <Button
                                    variant="outline"
                                    className="rounded-2xl border-[#0B3D6F] text-[#0B3D6F] font-black text-[11px] uppercase tracking-widest px-10 h-14 hover:bg-[#0B3D6F] hover:text-white transition-all shadow-lg shadow-blue-900/5 active:scale-95"
                                    onClick={() => {
                                        setActiveCategory('all')
                                        setPriceRange([0, 2000])
                                        setSelectedAmenities([])
                                    }}
                                >
                                    Reset all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAP COLUMN */}
                <div className={cn(
                    "flex-1 h-full z-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative border-l border-slate-100 bg-slate-50/50",
                    viewMode === 'list' ? "hidden" : "block"
                )}>
                    <div className="w-full h-full relative group/map p-6">
                        <MapView
                            properties={properties}
                            onBoundsChange={setMapBounds}
                        />

                        {/* High-End Map Control Overlay */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                            <button className="bg-white/80 backdrop-blur-2xl px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 text-[10px] font-black uppercase tracking-[0.2em] text-[#0B3D6F] hover:bg-white hover:text-[#F17720] transition-all flex items-center gap-3 active:scale-95 group/btn">
                                <div className="relative w-2.5 h-2.5">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full group-hover/btn:bg-[#F17720]" />
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-60" />
                                </div>
                                Discovery active
                            </button>
                        </div>

                        {/* Map Zoom Controls (Aesthetic) */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                            {/* Mapbox provides these, but we could add custom HUD elements here */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation - Ultra Modern */}
            <div className="md:hidden border-t bg-white/90 backdrop-blur-2xl px-10 py-6 flex items-center justify-between z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button className="flex flex-col items-center gap-1.5 text-[#F17720]">
                    <Search className="w-6 h-6" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Explore</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-[#0B3D6F] transition-colors">
                    <MapIcon className="w-6 h-6" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Map</span>
                </button>
                <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center -mt-12 shadow-xl border-t-0">
                    <div className="w-8 h-8 rounded-full bg-[#0B3D6F] shadow-lg shadow-blue-900/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
                <button className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-[#0B3D6F] transition-colors">
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Saved</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-[#0B3D6F] transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Profile</span>
                </button>
            </div>
        </div>
    )
}

