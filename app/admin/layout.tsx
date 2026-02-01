'use client'

import { useUser } from "@/components/providers/user-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Home, Shield, Users, Building, LogOut } from "lucide-react"
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, isLoading, signOut } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
            } else if (profile?.role !== 'admin') {
                router.push('/')
            }
        }
    }, [user, profile, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020202] gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B88746] border-t-transparent" />
                <div className="text-[#B88746] font-medium tracking-wide animate-pulse">Loading Admin Portal...</div>
            </div>
        )
    }

    if (!user || profile?.role !== 'admin') return null

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-[#020202] text-white flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <span className="text-xl font-bold tracking-tight">
                        DARLINK <span className="text-[#B88746]">ADMIN</span>
                    </span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <Link href="/admin/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white/10 text-white">
                        <Shield className="mr-3 h-5 w-5 text-[#B88746]" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 text-gray-300 hover:text-white">
                        <Users className="mr-3 h-5 w-5" />
                        Users
                    </Link>
                    <Link href="/admin/properties" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 text-gray-300 hover:text-white">
                        <Building className="mr-3 h-5 w-5" />
                        All Properties
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-[#B88746] flex items-center justify-center text-black font-bold text-xs">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">Admin</p>
                            <p className="truncate text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
                    <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#B88746]">
                            View Client Site
                        </Link>
                        <button onClick={signOut} className="text-sm font-medium text-red-600 hover:text-red-700">
                            Sign out
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
