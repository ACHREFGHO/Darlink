'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, Globe, User, LogOut, LayoutDashboard, Heart, Briefcase, MapPin, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/providers/language-provider'
import { AuthModal } from '@/components/auth/auth-modal'

interface NavbarProps {
    user: any
    userRole?: string
    variant?: 'home' | 'inner'
}

export function Navbar({ user, userRole = 'client', variant = 'home' }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authView, setAuthView] = useState<'signin' | 'signup'>('signin')
    const supabase = createClient()
    const router = useRouter()
    const { language, setLanguage, t } = useLanguage()

    const languages = [
        { code: 'en', label: 'English', flag: '��', region: 'GB' },
        { code: 'fr', label: 'Français', flag: '🇫🇷', region: 'FR' },
        { code: 'ar', label: 'العربية', flag: '🇹🇳', region: 'TN' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹', region: 'IT' },
    ]

    const activeLang = languages.find(l => l.code === language) || languages[0]

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    // Determine branding colors based on scroll state and variant
    const isTransparent = variant === 'home' && !scrolled
    const logoClass = cn(
        "h-full w-auto object-contain transition-all duration-300",
        isTransparent ? "brightness-0 invert" : ""
    )

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 border-b",
                isTransparent
                    ? "bg-transparent border-transparent py-6"
                    : "bg-white/80 backdrop-blur-md border-white/20 py-4 shadow-sm"
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-6">
                {/* Logo */}
                <Link className="flex items-center gap-3 group transition-opacity hover:opacity-90" href="/">
                    <div className="relative h-10 md:h-12 w-auto">
                        <img
                            src="/images/logo_darlink.png"
                            alt="DARLINK Logo"
                            className={cn(logoClass, "drop-shadow-md")}
                        />
                    </div>
                    <div className="hidden sm:flex flex-col justify-center -space-y-1">
                        <div className="leading-none flex items-baseline">
                            <span className={cn(
                                "font-extrabold text-2xl tracking-tight text-[#0B3D6F]",
                                isTransparent ? "text-white" : ""
                            )}>
                                DAR
                            </span>
                            <span className={cn(
                                "font-bold text-2xl tracking-tight text-[#F17720]",
                                isTransparent ? "text-white/90" : ""
                            )}>
                                LINK
                            </span>
                            <span className={cn(
                                "text-sm font-medium ml-0.5 opacity-60",
                                isTransparent ? "text-white" : "text-[#0B3D6F]"
                            )}>.tn</span>
                        </div>
                        <span className={cn(
                            "text-[10px] uppercase tracking-[0.2em] font-medium opacity-80 hidden lg:block",
                            isTransparent ? "text-blue-100" : "text-slate-500"
                        )}>
                            Authentic Tunisian Stays
                        </span>
                    </div>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Navigation Links */}
                    <div className={cn(
                        "hidden md:flex items-center gap-6 font-medium text-[15px] transition-colors",
                        isTransparent ? "text-white/90" : "text-gray-600"
                    )}>
                        <Link href="/search" className="hover:text-[#F17720] transition-colors">{t.navbar.stays}</Link>
                        <Link href="/experiences" className="hover:text-[#F17720] transition-colors">{t.navbar.experiences}</Link>
                    </div>

                    {/* Mode Switcher / Host Call to Action */}
                    {!userRole?.includes('owner') ? (
                        <Link
                            href="/owner/properties/new"
                            className={cn(
                                "hidden md:block text-sm font-semibold hover:bg-white/10 px-4 py-2 rounded-full transition-colors",
                                isTransparent ? "text-white" : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {t.navbar.becomeHost}
                        </Link>
                    ) : (
                        <Link
                            href="/owner/dashboard"
                            className={cn(
                                "hidden md:block text-sm font-semibold hover:bg-white/10 px-4 py-2 rounded-full transition-colors",
                                isTransparent ? "text-white" : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {t.navbar.switchToHosting}
                        </Link>
                    )}

                    {/* Language Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className={cn(
                                "h-10 px-3 cursor-pointer transition-colors hidden sm:flex items-center justify-center rounded-full hover:bg-white/10 border",
                                isTransparent ? "text-white border-white/30" : "text-gray-700 hover:bg-gray-100 border-gray-200"
                            )}>
                                <span className="text-xs font-bold tracking-wider">
                                    {activeLang.region}
                                </span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-gray-100 w-48">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code as any)}
                                    className="cursor-pointer py-3 px-4 font-medium text-gray-700 focus:bg-gray-50 focus:text-black flex items-center justify-between group"
                                >
                                    <span className="text-sm">{lang.label}</span>
                                    <span className="ml-4 px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded group-hover:bg-[#0B3D6F] group-hover:text-white transition-colors">
                                        {lang.region}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border transition-all hover:shadow-md",
                                isTransparent
                                    ? "bg-black/20 border-white/30 text-white hover:bg-black/30"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            )}>
                                <Menu className="w-4 h-4 md:w-5 md:h-5" />
                                <Avatar className="w-7 h-7 md:w-8 md:h-8 border border-white/10">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-gray-500 text-white text-[10px] md:text-xs">
                                        {user ? user.email?.[0].toUpperCase() : <User className="w-3 h-3 md:w-4 md:h-4" />}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border-gray-100 mt-2 bg-white">
                            {!user ? (
                                <>
                                    <DropdownMenuItem className="font-bold py-3 cursor-pointer" onClick={() => { setAuthView('signin'); setIsAuthModalOpen(true) }}>
                                        {t.navbar.login}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => { setAuthView('signup'); setIsAuthModalOpen(true) }}>
                                        {t.navbar.signup}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => router.push('/owner/properties/new')}>
                                        {t.navbar.becomeHost}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-3 cursor-pointer">
                                        {t.navbar.help}
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {/* Client Actions */}
                                    <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => router.push('/bookings')}>
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        {t.navbar.myTrips}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => router.push('/favorites')}>
                                        <Heart className="w-4 h-4 mr-2" />
                                        {t.navbar.wishlists}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {/* Owner Actions */}
                                    {(userRole === 'house_owner' || userRole === 'admin') && (
                                        <>
                                            <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => router.push('/owner/dashboard')}>
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                {t.navbar.manageListings}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    {/* Admin Actions */}
                                    {userRole === 'admin' && (
                                        <>
                                            <DropdownMenuItem className="py-2.5 cursor-pointer font-semibold text-[#B88746]" onClick={() => router.push('/admin/dashboard')}>
                                                {t.navbar.adminPortal}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => router.push('/account')}>
                                        <User className="w-4 h-4 mr-2" />
                                        {t.navbar.account}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5 cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {t.navbar.logout}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} defaultView={authView} />
        </header>
    )
}
