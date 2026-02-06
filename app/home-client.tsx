'use client'

import React, { useState } from 'react' // Fixed: Added React back
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/site/search-bar'
import { PropertyCardListing } from '@/components/properties/property-card-listing'
import { Search, ArrowRight, LayoutGrid, Map as MapIcon, Mail, Phone, MapPin } from 'lucide-react' // Fixed: Added LayoutGrid, aliased Map
import { Navbar } from '@/components/site/navbar'
import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils' // Fixed: Added cn
import { MapView } from '@/components/site/map-view' // Fixed: Added MapView

interface HomeClientProps {
    properties: any[]
    user: any
    userRole: string
    favoriteIds: string[]
}

export function HomeClient({ properties, user, userRole, favoriteIds }: HomeClientProps) {
    const { t } = useLanguage()
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const [showFloatingButton, setShowFloatingButton] = useState(true)
    const [mapBounds, setMapBounds] = useState<{ sw: [number, number], ne: [number, number] } | null>(null)



    // Filter properties based on map bounds
    const filteredProperties = React.useMemo(() => {
        if (!mapBounds) return properties

        return properties.filter(property => {
            if (!property.latitude || !property.longitude) return false

            const isWithinLat = property.latitude >= mapBounds.sw[1] && property.latitude <= mapBounds.ne[1]
            const isWithinLng = property.longitude >= mapBounds.sw[0] && property.longitude <= mapBounds.ne[0]

            return isWithinLat && isWithinLng
        })
    }, [properties, mapBounds, viewMode])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={user} userRole={userRole} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/beach-house.png"
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0B3D6F]/90" />
                    </div>

                    <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8 pt-20">
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg whitespace-pre-line">
                                {t.home.heroTitle.split('\n').map((line, i) => (
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
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0B3D6F]">{t.home.featuredTitle}</h2>
                                <p className="text-muted-foreground mt-2 text-lg">{t.home.featuredSubtitle}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link href="/search" className="hidden md:flex items-center text-[#F17720] font-semibold hover:gap-2 transition-all">
                                    {t.home.viewAll} <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>

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
                                    {/* Globe Branded Overlay: Only visible in globe mode */}
                                    <div className="absolute inset-0 z-20 pointer-events-none rounded-[3rem] overflow-hidden opacity-30 bg-[radial-gradient(circle_at_center,transparent_40%,#0B3D6F_100%)] mix-blend-multiply" />

                                    <MapView
                                        properties={properties}
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

            {/* Floating View Switcher (Strategic Placement) */}
            <div className={cn(
                "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform",
                showFloatingButton ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-90 pointer-events-none"
            )}>
                <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="group relative flex items-center gap-3 px-6 py-4 bg-[#0B3D6F] text-white rounded-full shadow-[0_20px_50px_rgba(11,61,111,0.3)] hover:shadow-[0_25px_60px_rgba(11,61,111,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 border border-white/20 backdrop-blur-md"
                >
                    {/* Background glow effect */}
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

                    {/* Badge/Dot */}
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
