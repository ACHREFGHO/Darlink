'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/site/search-bar'
import { PropertyCardListing } from '@/components/properties/property-card-listing'
import { Search, ArrowRight, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { useLanguage } from '@/components/providers/language-provider'

interface HomeClientProps {
    properties: any[]
    user: any
    userRole: string
    favoriteIds: string[]
}

export function HomeClient({ properties, user, userRole, favoriteIds }: HomeClientProps) {
    const { t } = useLanguage()

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
                            <Link href="/search" className="hidden md:flex items-center text-[#F17720] font-semibold hover:gap-2 transition-all">
                                {t.home.viewAll} <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>

                        {properties && properties.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {properties.map((property, index) => (
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
                        )}
                    </div>
                </section>
            </main>

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
