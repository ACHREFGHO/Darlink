import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminPropertiesClient } from "@/components/admin/admin-properties-client"
import { Building2, CheckCircle2, AlertCircle, XCircle } from "lucide-react"

export default async function AdminPropertiesPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string, owner?: string, governorate?: string, status?: string }>
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

    // 2. Fetch Filter Data (Owners & Governorates)
    const { data: owners } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'house_owner')

    // 3. Build Query
    let queryBuilder = supabase
        .from('properties')
        .select(`
            *,
            profiles(full_name, email, avatar_url),
            rooms(count)
        `)
        .order('created_at', { ascending: false })

    if (params.status && params.status !== 'all') {
        queryBuilder = queryBuilder.eq('status', params.status)
    }
    if (params.owner && params.owner !== 'all') {
        queryBuilder = queryBuilder.eq('owner_id', params.owner)
    }
    if (params.governorate && params.governorate !== 'all') {
        queryBuilder = queryBuilder.eq('governorate', params.governorate)
    }

    const { data: allProperties } = await queryBuilder

    // Client-side search for title
    let filteredProperties = allProperties || []
    if (params.query) {
        const q = params.query.toLowerCase()
        filteredProperties = filteredProperties.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.city.toLowerCase().includes(q)
        )
    }

    // Stats
    const stats = {
        total: allProperties?.length || 0,
        pending: allProperties?.filter(p => p.status === 'Pending').length || 0,
        published: allProperties?.filter(p => p.status === 'Published').length || 0,
        rejected: allProperties?.filter(p => p.status === 'Rejected').length || 0,
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                        <Building2 className="w-3 h-3" /> Property Inventory
                    </div>
                    <h1 className="text-5xl font-black text-[#0B3D6F] tracking-tighter">Manage All Properties</h1>
                    <p className="text-slate-400 font-medium text-lg">Review submissions, manage status, and oversee the marketplace listings.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="All Listings"
                    value={stats.total}
                    icon={<Building2 className="w-6 h-6" />}
                    color="bg-slate-100 text-slate-600"
                />
                <StatCard
                    label="Pending Approval"
                    value={stats.pending}
                    icon={<AlertCircle className="w-6 h-6" />}
                    color="bg-orange-50 text-[#F17720]"
                    isAlert={stats.pending > 0}
                />
                <StatCard
                    label="Published"
                    value={stats.published}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    label="Rejected"
                    value={stats.rejected}
                    icon={<XCircle className="w-6 h-6" />}
                    color="bg-red-50 text-red-500"
                />
            </div>

            {/* Main Content Area */}
            <AdminPropertiesClient
                initialProperties={filteredProperties}
                owners={owners || []}
            />
        </div>
    )
}

function StatCard({ label, value, icon, color, isAlert = false }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
                </div>
            </div>
            {isAlert && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded-full animate-bounce">
                    NEEDS REVIEW
                </div>
            )}
            <div className={`absolute -bottom-6 -right-6 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${color.split(' ')[0]}`}>
                {icon}
            </div>
        </div>
    )
}
