import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminUsersClient } from "@/components/admin/admin-users-client"
import { Users, ShieldCheck, Home, UserCheck } from "lucide-react"

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string, role?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        redirect('/')
    }

    // 2. Build Query with Property Count join
    let queryBuilder = supabase
        .from('profiles')
        .select(`
            *,
            properties:properties(count)
        `)
        .order('created_at', { ascending: false })

    if (params.role && params.role !== 'all') {
        queryBuilder = queryBuilder.eq('role', params.role)
    }

    const { data: users, error } = await queryBuilder

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 font-bold">Failed to load users: {error.message}</div>
    }

    // Client-side search for name/email
    let filteredUsers = users || []
    if (params.query) {
        const q = params.query.toLowerCase()
        filteredUsers = filteredUsers.filter(u =>
            u.full_name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )
    }

    // Map properties count for the client
    const mappedUsers = filteredUsers.map(u => ({
        ...u,
        properties_count: u.properties?.[0]?.count || 0
    }))

    // Stats
    const stats = {
        total: users?.length || 0,
        admins: users?.filter(u => u.role === 'admin').length || 0,
        owners: users?.filter(u => u.role === 'house_owner').length || 0,
        clients: users?.filter(u => u.role === 'client').length || 0,
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 shadow-sm">
                        <Users className="w-3 h-3" /> Access Control
                    </div>
                    <h1 className="text-5xl font-black text-[#0B3D6F] tracking-tighter">User Directory</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage platform identities, permissions, and professional roles.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="All Accounts"
                    value={stats.total}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-slate-100 text-slate-600"
                />
                <StatCard
                    label="Administrator"
                    value={stats.admins}
                    icon={<ShieldCheck className="w-6 h-6" />}
                    color="bg-slate-900 text-white"
                />
                <StatCard
                    label="House Owners"
                    value={stats.owners}
                    icon={<Home className="w-6 h-6" />}
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    label="Platform Clients"
                    value={stats.clients}
                    icon={<UserCheck className="w-6 h-6" />}
                    color="bg-blue-50 text-blue-600"
                />
            </div>

            {/* Main Content Area */}
            <AdminUsersClient
                initialUsers={mappedUsers}
            />
        </div>
    )
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="flex items-center gap-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                </div>
            </div>
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${color.split(' ')[0]}`}>
                {icon}
            </div>
        </div>
    )
}
