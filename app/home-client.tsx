'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/site/search-bar'
import { PropertyCardListing } from '@/components/properties/property-card-listing'
import { Search, ArrowRight, LayoutGrid, Map as MapIcon, Filter, Wifi, Waves, Car, Wind, Tv, Utensils, Monitor, Coffee } from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'
import { MapView } from '@/components/site/map-view'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useCurrency } from '@/components/providers/currency-provider'
import { motion } from 'framer-motion'
import { GlowingSun, AnimatedWaves, FloatingLeaves } from '@/components/site/ambient-animations'

interface HomeClientProps {
    properties: any[]
    user: any
    userRole: string
    favoriteIds: string[]
}

const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'ac', label: 'A/C', icon: Wind },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'workspace', label: 'Work-desk', icon: Monitor },
    { id: 'coffee', label: 'Coffee', icon: Coffee },
]

export function HomeClient({ properties, user, userRole, favoriteIds }: HomeClientProps) {
    const { t } = useLanguage()
    const { formatPrice } = useCurrency()
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const [showFloatingButton, setShowFloatingButton] = useState(true)
    const [mapBounds, setMapBounds] = useState<{ sw: [number, number], ne: [number, number] } | null>(null)

    // Advanced Filters State
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

    // Filter properties based on all criteria
    const filteredProperties = React.useMemo(() => {
        let result = properties

        // 1. Map Bounds Filter
        if (mapBounds) {
            result = result.filter(property => {
                if (!property.latitude || !property.longitude) return false
                const isWithinLat = property.latitude >= mapBounds.sw[1] && property.latitude <= mapBounds.ne[1]
                const isWithinLng = property.longitude >= mapBounds.sw[0] && property.longitude <= mapBounds.ne[0]
                return isWithinLat && isWithinLng
            })
        }

        // 2. Price Range Filter
        result = result.filter(p => {
            const prices = p.rooms?.map((r: any) => Number(r.price_per_night)) || []
            if (prices.length === 0) return true
            const min = Math.min(...prices)
            return min >= priceRange[0] && min <= priceRange[1]
        })

        // 3. Amenities Filter
        if (selectedAmenities.length > 0) {
            result = result.filter(p => {
                const pAm = p.property_amenities?.map((a: any) => a.amenity) || []
                return selectedAmenities.every(am => pAm.includes(am))
            })
        }

        return result
    }, [properties, mapBounds, viewMode, priceRange, selectedAmenities])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={user} userRole={userRole} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
                    <GlowingSun />
                    <AnimatedWaves />

                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <motion.img
                            src="/images/door.jpg"
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0B3D6F]/90" />
                    </div>

                    <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8 pt-20">
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg whitespace-pre-line">
                                {t.home.heroTitle.split('\n').map((line: any, i: number) => (
                                    <React.Fragment key={i}>
                                        {i === 1 ? <span className="text-[#F17720]">{line}</span> : line}
                                        {i === 0 && <br />}
                                    </React.Fragment>
                                ))}
                            </h1>
                            <p className="max-w-[700px] mx-auto text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
                                {t.home.heroSubtitle}
                            </p>
                        </div>

                        <div className="w-full max-w-6xl">
                            <SearchBar />
                        </div>
                    </div>
                </section>

                {/* Featured Properties Grid */}
                <section className="bg-gray-50 py-20 relative overflow-hidden" id="stays">
                    <FloatingLeaves />
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0B3D6F]">{t.home.featuredTitle}</h2>
                                <p className="text-muted-foreground mt-2 text-lg">{t.home.featuredSubtitle}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="rounded-full border-[#0B3D6F]/20 text-[#0B3D6F] hover:bg-slate-100 px-6 h-12 gap-2 shadow-sm whitespace-nowrap">
                                            <Filter className="w-4 h-4" />
                                            Filters {(selectedAmenities.length > 0) && `(${selectedAmenities.length})`}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl rounded-[2rem] overflow-hidden p-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black text-[#0B3D6F] mb-6">Advanced Filters</DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-10 py-4">
                                            {/* Price Range */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-[#0B3D6F]">Price Range</h3>
                                                    <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                                        <span className="text-sm font-black text-[#F17720]">{formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
                                                    </div>
                                                </div>
                                                <Slider
                                                    defaultValue={[0, 1000]}
                                                    max={1500}
                                                    step={10}
                                                    value={priceRange}
                                                    onValueChange={(val) => setPriceRange(val as [number, number])}
                                                    className="py-4"
                                                />
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>Min</span>
                                                    <span>Max+</span>
                                                </div>
                                            </div>

                                            <Separator className="bg-slate-100" />

                                            {/* Amenities */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-bold text-[#0B3D6F]">Essentials & Features</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {AMENITIES.map((am) => {
                                                        const Icon = am.icon
                                                        const isSelected = selectedAmenities.includes(am.id)
                                                        return (
                                                            <div
                                                                key={am.id}
                                                                onClick={() => {
                                                                    setSelectedAmenities(prev =>
                                                                        prev.includes(am.id)
                                                                            ? prev.filter(a => a !== am.id)
                                                                            : [...prev, am.id]
                                                                    )
                                                                }}
                                                                className={cn(
                                                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:scale-105",
                                                                    isSelected
                                                                        ? "border-[#F17720] bg-orange-50/50 text-[#F17720]"
                                                                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                                                )}
                                                            >
                                                                <Icon className={cn("w-6 h-6 mb-2 transition-transform group-hover:rotate-6", isSelected && "animate-pulse")} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-center">{am.label}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 flex items-center justify-between border-t border-slate-100 mt-4">
                                            <Button
                                                variant="ghost"
                                                className="text-slate-400 font-bold hover:text-slate-900"
                                                onClick={() => {
                                                    setPriceRange([0, 1000])
                                                    setSelectedAmenities([])
                                                }}
                                            >
                                                Clear all
                                            </Button>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="bg-[#0B3D6F] hover:bg-[#F17720] text-white rounded-full px-8 h-12 font-bold transition-all"
                                                >
                                                    Show {filteredProperties.length} Stays
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Link href="/search" className="hidden md:flex items-center text-[#F17720] font-semibold hover:gap-2 transition-all">
                                    {t.home.viewAll} <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-200/60 mb-12" />

                        {viewMode === 'map' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500 relative -mx-4 md:-mx-6 lg:-mx-12">
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs px-4">
                                    <div className="bg-white/80 backdrop-blur-2xl px-6 py-3.5 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3.5 border border-white/40 group/badge hover:scale-105 transition-all duration-500">
                                        <div className="relative flex items-center justify-center h-5 w-5">
                                            <div className="absolute h-full w-full bg-emerald-500/20 rounded-full animate-ping" />
                                            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B3D6F]/50 leading-none mb-0.5">
                                                Marketplace Active
                                            </span>
                                            <span className="text-sm font-black text-[#0B3D6F] tracking-tight whitespace-nowrap">
                                                {filteredProperties.length} {filteredProperties.length === 1 ? 'Stay' : 'Stays'} available now
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 md:px-6 lg:px-12 h-[780px] min-h-[600px] w-full relative">
                                    <div className="absolute inset-0 z-20 pointer-events-none rounded-[3rem] overflow-hidden opacity-30 bg-[radial-gradient(circle_at_center,transparent_40%,#0B3D6F_100%)] mix-blend-multiply" />
                                    <MapView
                                        properties={filteredProperties}
                                        onBoundsChange={setMapBounds}
                                        projection="globe"
                                    />
                                </div>
                            </div>
                        ) : (
                            filteredProperties && filteredProperties.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                    {filteredProperties.map((property, index) => (
                                        <PropertyCardListing
                                            key={property.id}
                                            property={property}
                                            index={index}
                                            isFavorited={favoriteIds.includes(property.id)}
                                            userId={user?.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                                    <div className="bg-[#F17720]/10 p-4 rounded-full mb-4">
                                        <Search className="w-8 h-8 text-[#F17720]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.home.noStays}</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        {t.home.noStaysDesc}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </main>

            {/* Floating View Switcher */}
            <div className={cn(
                "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform",
                showFloatingButton ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-90 pointer-events-none"
            )}>
                <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="group relative flex items-center gap-3 px-6 py-4 bg-[#0B3D6F] text-white rounded-full shadow-[0_20px_50px_rgba(11,61,111,0.3)] hover:shadow-[0_25px_60px_rgba(11,61,111,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 border border-white/20 backdrop-blur-md"
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                        {viewMode === 'list' ? (
                            <>
                                <span className="font-bold tracking-wide text-sm">{t.home.viewMap || "Show Map"}</span>
                                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-[#F17720] transition-colors duration-300">
                                    <MapIcon className="w-5 h-5" />
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="font-bold tracking-wide text-sm">{t.home.viewList || "Show List"}</span>
                                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-[#F17720] transition-colors duration-300">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#F17720] rounded-full border-2 border-[#0B3D6F] animate-pulse" />
                </button>
            </div>

            <footer className="w-full bg-[#0B3D6F] text-white py-12">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-auto">
                                <img src="/images/logo_darlink.png" alt="Logo" className="h-full object-contain" />
                            </div>
                            <div className="flex flex-col justify-center -space-y-1">
                                <div className="leading-none flex items-baseline">
                                    <span className="font-extrabold text-xl tracking-tight text-white">DAR</span>
                                    <span className="font-bold text-xl tracking-tight text-[#F17720]">LINK</span>
                                    <span className="text-xs font-medium ml-0.5 opacity-60 text-white">.tn</span>
                                </div>
                            </div>
                        </Link>
                        <p className="text-blue-200 text-sm leading-relaxed">
                            {t.footer.about}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-4">{t.footer.platform}</h4>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">{t.footer.browse}</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">{t.footer.beHost}</Link></li>
                            <li><Link href="/login" className="hover:text-white transition-colors">{t.navbar.login}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-4">{t.footer.support}</h4>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li><Link href="/help" className="hover:text-white transition-colors">{t.navbar.help}</Link></li>
                            <li><Link href="/trust-safety" className="hover:text-white transition-colors">{t.footer.trust}</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.contact}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-4">{t.footer.newsletter}</h4>
                        <p className="text-blue-200 text-sm mb-4">{t.footer.subscribe}</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder={t.footer.emailPlaceholder} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-blue-300 w-full focus:outline-none focus:border-[#F17720]" />
                            <Button className="bg-[#F17720] hover:bg-[#d1661b]">&rarr;</Button>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-blue-300">
                    <p>© 2026 {t.footer.rights}</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white">{t.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-white">{t.footer.terms}</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
