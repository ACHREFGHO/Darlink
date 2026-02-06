import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OwnerBookingCard } from "@/components/owner/owner-booking-card"
import { BookingsFilter } from "@/components/owner/bookings-filter"
import { CheckCircle2, Clock, Calendar, TrendingUp, AlertCircle, Inbox } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function OwnerBookingsPage({
    searchParams,
}: {
    searchParams: Promise<{ propertyId?: string, query?: string }>
}) {
    const params = await searchParams
    const selectedPropertyId = params?.propertyId
    const searchQuery = params?.query?.toLowerCase()

    const supabase = await createClient()

    // 1. Check Auth & Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'house_owner' && profile.role !== 'admin')) {
        redirect('/')
    }

    // 2. Fetch Owner's Properties
    const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', user.id)

    const allPropertyIds = properties?.map(p => p.id) || []
    const propertyIdsToFetch = (selectedPropertyId && selectedPropertyId !== 'all') ? [selectedPropertyId] : allPropertyIds

    let bookings: any[] = []

    if (allPropertyIds.length > 0) {
        let queryBuilder = supabase
            .from('bookings')
            .select(`
                *,
                room:rooms(name),
                guest:profiles(full_name, email, phone, avatar_url)
            `)
            .in('property_id', propertyIdsToFetch)
            .order('created_at', { ascending: false })

        const { data: fetchedBookings } = await queryBuilder

        bookings = fetchedBookings?.map(b => ({
            ...b,
            property: properties?.find(p => p.id === b.property_id)
        })) || []

        // Apply Client-side filtering for Search Query
        if (searchQuery) {
            bookings = bookings.filter(b =>
                b.guest?.full_name?.toLowerCase().includes(searchQuery) ||
                b.property?.title?.toLowerCase().includes(searchQuery) ||
                b.room?.name?.toLowerCase().includes(searchQuery)
            )
        }
    }

    // Stats (Always from ALL properties)
    const { data: allStatsBookings } = await supabase
        .from('bookings')
        .select('status, total_price')
        .in('property_id', allPropertyIds)

    const pendingCount = allStatsBookings?.filter((b: any) => b.status === 'pending').length || 0
    const confirmedCount = allStatsBookings?.filter((b: any) => b.status === 'confirmed').length || 0
    const totalEarnings = allStatsBookings?.filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0) || 0

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F17720] text-xs font-black uppercase tracking-widest border border-orange-100">
                        <Clock className="w-3 h-3" /> Booking Hub
                    </div>
                    <h1 className="text-5xl font-black text-[#0B3D6F] tracking-tighter">Reservations</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage your guest requests and track your business growth.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-slate-50 shadow-sm text-sm font-bold text-slate-500">
                    <Calendar className="w-5 h-5 text-[#F17720]" />
                    <span className="uppercase tracking-wide">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F17720] shadow-inner">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Waiting for Approval</p>
                            <div className="flex items-center gap-3">
                                <p className="text-5xl font-black text-slate-900 tracking-tighter">{pendingCount}</p>
                                {pendingCount > 0 && (
                                    <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-full animate-bounce">ACTION REQUIRED</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Confirmed Bookings</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter">{confirmedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-[#0B3D6F] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[100px]" />
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-xl">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-blue-200/60 uppercase tracking-[0.2em] mb-1">Estimated Revenue</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-5xl font-black tracking-tighter">{totalEarnings.toLocaleString()}</p>
                                <span className="text-xl font-bold text-blue-200">TND</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Bookings List */}
            <div className="space-y-8">
                <BookingsFilter properties={properties || []} />

                <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2.5 bg-[#F17720] rounded-full shadow-lg shadow-orange-100" />
                            <h2 className="text-3xl font-black text-[#0B3D6F] tracking-tight">Booking Stream</h2>
                        </div>
                        <TabsList className="grid w-full sm:w-[320px] grid-cols-2 bg-slate-100 p-1.5 rounded-[1.25rem] h-14">
                            <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#0B3D6F] font-black text-slate-400 uppercase tracking-widest text-xs transition-all">Upcoming</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#0B3D6F] font-black text-slate-400 uppercase tracking-widest text-xs transition-all">History</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="upcoming" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.filter((b: any) => {
                                const endDate = new Date(b.end_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return b.status === 'pending' || (b.status === 'confirmed' && endDate >= today);
                            }).length > 0 ? (
                                bookings.filter((b: any) => {
                                    const endDate = new Date(b.end_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return b.status === 'pending' || (b.status === 'confirmed' && endDate >= today);
                                }).map((booking: any) => (
                                    <OwnerBookingCard key={booking.id} booking={booking} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-center px-8">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Inbox className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">No results</h3>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                                        {searchQuery || selectedPropertyId ? "No bookings match your filters." : "You don't have any upcoming reservations."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.filter((b: any) => {
                                const endDate = new Date(b.end_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return b.status === 'cancelled' || b.status === 'rejected' || (b.status === 'confirmed' && endDate < today);
                            }).length > 0 ? (
                                bookings.filter((b: any) => {
                                    const endDate = new Date(b.end_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return b.status === 'cancelled' || b.status === 'rejected' || (b.status === 'confirmed' && endDate < today);
                                }).map((booking: any) => (
                                    <OwnerBookingCard key={booking.id} booking={booking} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-center px-8">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">No history</h3>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                                        {searchQuery || selectedPropertyId ? "No bookings match your filters." : "Completed or cancelled bookings will show up here."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
