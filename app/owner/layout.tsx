'use client'

import { useUser } from "@/components/providers/user-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Home, Building, Settings, LogOut, Shield } from "lucide-react"
import type { ReactNode } from "react"

export default function OwnerLayout({ children }: { children: ReactNode }) {
    const { user, profile, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
            } else if (profile && profile.role !== 'house_owner' && profile.role !== 'admin') {
                // If user is client, redirect to home or upgrade page?
                router.push('/')
            }
        }
    }, [user, profile, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-white gap-4 z-50 relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0B3D6F] border-t-transparent" />
                <div className="text-[#0B3D6F] font-medium tracking-wide animate-pulse">Loading DARLINK...</div>
            </div>
        )
    }

    if (!user || (profile?.role !== 'house_owner' && profile?.role !== 'admin')) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 flex-col bg-[#0B3D6F] text-white md:flex">
                <div className="flex h-16 items-center border-b border-white/10 px-6">
                    <span className="text-2xl font-black tracking-tighter">
                        DARLINK<span className="text-[#F17720]">.tn</span>
                    </span>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-6">
                    <NavItem href="/owner/dashboard" icon={<Home className="mr-3 h-5 w-5" />}>
                        Dashboard
                    </NavItem>
                    <NavItem href="/owner/properties" icon={<Building className="mr-3 h-5 w-5" />}>
                        My Properties
                    </NavItem>
                    <NavItem href="/owner/settings" icon={<Settings className="mr-3 h-5 w-5" />}>
                        Settings
                    </NavItem>
                </nav>

                <div className="border-t border-white/10 p-4 space-y-4">
                    {profile?.role === 'admin' && (
                        <Link href="/admin/dashboard" className="flex items-center text-sm font-medium text-[#F17720] hover:text-[#ff9852]">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Portal
                        </Link>
                    )}

                    <Link href="/" className="flex items-center text-sm font-medium text-white/70 hover:text-white">
                        <LogOut className="mr-2 h-4 w-4" />
                        Switch to Buying
                    </Link>

                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate font-medium">{profile?.full_name}</p>
                            <p className="truncate text-xs text-white/70">{profile?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm md:hidden">
                    <span className="text-xl font-bold text-[#0B3D6F]">DARLINK</span>
                    {/* Mobile Menu Button would go here */}
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavItem({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
    // Simplistic active state check, ideally compare with pathname
    return (
        <Link
            href={href}
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white"
        >
            {icon}
            {children}
        </Link>
    )
}
