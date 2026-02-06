'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Search,
    User,
    ShieldCheck,
    Mail,
    Calendar,
    MoreHorizontal,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    UserCircle,
    Building2,
    Filter,
    X,
    Loader2,
    Check
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { updateUserRole } from "@/app/actions/users"

interface AdminUsersClientProps {
    initialUsers: any[]
}

const ROLES = [
    { label: 'Client', value: 'client', color: 'bg-blue-100 text-blue-600' },
    { label: 'House Owner', value: 'house_owner', color: 'bg-purple-100 text-purple-600' },
    { label: 'Admin', value: 'admin', color: 'bg-slate-900 text-white' },
]

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const [query, setQuery] = useState(searchParams.get('query') || '')
    const [role, setRole] = useState(searchParams.get('role') || 'all')
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('query', debouncedQuery)
        if (role !== 'all') params.set('role', role)
        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedQuery, role, router])

    const handleRoleChange = async (userId: string, newRole: string) => {
        setIsLoading(userId)
        try {
            const result = await updateUserRole(userId, newRole)
            if (result.success) {
                toast.success(`Role updated to ${newRole}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update role")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-16 pl-14 pr-6 rounded-[1.25rem] border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-bold placeholder:text-slate-300 transition-all shadow-inner"
                    />
                </div>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-16 w-full md:w-[240px] rounded-[1.25rem] border-slate-100 bg-slate-50/50 font-bold text-slate-600 shadow-inner px-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="All Roles" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 border-2 shadow-2xl">
                        <SelectItem value="all" className="font-bold py-3 px-4">All User Roles</SelectItem>
                        {ROLES.map(r => (
                            <SelectItem key={r.value} value={r.value} className="font-bold py-3 px-4">
                                {r.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {(query || role !== 'all') && (
                    <Button
                        variant="ghost"
                        className="h-16 px-8 rounded-[1.25rem] text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest"
                        onClick={() => {
                            setQuery('')
                            setRole('all')
                        }}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                )}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="w-[400px] h-20 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-10">Identity & Contact</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Permissions</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Health</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Portfolio</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Onboarding</TableHead>
                            <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrative</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialUsers.length > 0 ? (
                            initialUsers.map((user) => (
                                <TableRow key={user.id} className="group border-slate-50 hover:bg-slate-50/30 transition-all">
                                    <TableCell className="pl-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-14 w-14 border-4 border-white shadow-xl ring-1 ring-slate-100">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-slate-100 text-[#0B3D6F] font-black text-lg">
                                                    {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-[#0B3D6F] text-xl leading-none mb-2 truncate group-hover:text-[#F17720] transition-colors">{user.full_name || 'Anonymous User'}</span>
                                                <div className="flex items-center gap-2 group/email">
                                                    <Mail className="w-3.5 h-3.5 text-slate-300 group-hover/email:text-[#F17720] transition-colors" />
                                                    <span className="text-sm font-bold text-slate-400 truncate max-w-[200px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Badge
                                                className={`w-fit rounded-full px-5 py-1.5 font-black text-[9px] uppercase tracking-widest border-0 shadow-sm
                                                    ${user.role === 'admin' ? 'bg-slate-900 text-white' : ''}
                                                    ${user.role === 'house_owner' ? 'bg-purple-100 text-purple-600' : ''}
                                                    ${user.role === 'client' ? 'bg-blue-100 text-blue-600' : ''}
                                                `}
                                            >
                                                {user.role?.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {user.is_approved ? (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                    <UserCircle className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Standard</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-[#0B3D6F] leading-none mb-1">{user.properties_count || 0}</span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Properties</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 font-bold text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest ml-6">Registered</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-10 w-10 p-0 rounded-xl hover:bg-[#0B3D6F] hover:text-white transition-all shadow-sm"
                                                    disabled={isLoading === user.id}
                                                >
                                                    {isLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 p-2 shadow-2xl">
                                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority Console</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-slate-50 group transition-colors cursor-pointer" onClick={() => handleRoleChange(user.id, 'client')}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-700">Make Client</span>
                                                        {user.role === 'client' && <Check className="w-4 h-4 ml-auto text-green-500" />}
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-slate-50 group transition-colors cursor-pointer" onClick={() => handleRoleChange(user.id, 'house_owner')}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-700">Make Owner</span>
                                                        {user.role === 'house_owner' && <Check className="w-4 h-4 ml-auto text-green-500" />}
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-slate-50 group transition-colors cursor-pointer" onClick={() => handleRoleChange(user.id, 'admin')}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-700">Make Admin</span>
                                                        {user.role === 'admin' && <Check className="w-4 h-4 ml-auto text-green-500" />}
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[400px] text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="p-8 bg-white rounded-full shadow-2xl shadow-slate-200">
                                            <Search className="w-12 h-12 text-slate-100" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-[#0B3D6F] tracking-tighter">Identity Not Found</p>
                                            <p className="text-slate-400 font-medium">Try broadening your search or filtering by another role.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
