
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OwnerBookingCard } from "@/components/owner/owner-booking-card"
import { CheckCircle2, Clock, XCircle, Calendar, Users, Home, TrendingUp, AlertCircle, Inbox } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function OwnerBookingsPage() {
    const supabase = await createClient()

    // 1. Check Auth & Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'house_owner' && profile.role !== 'admin')) {
        redirect('/')
    }

    // 2. Fetch Owner's Properties first (Foolproof method)
    const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', user.id)

    const propertyIds = properties?.map(p => p.id) || []

    let bookings: any[] = []

    if (propertyIds.length > 0) {
        // 3. Fetch Bookings for these properties
        const { data: fetchedBookings } = await supabase
            .from('bookings')
            .select(`
                *,
                room:rooms(name),
                guest:profiles(full_name, email, phone, avatar_url)
            `)
            .in('property_id', propertyIds)
            .order('created_at', { ascending: false })

        // Manually attach property details to match expected structure
        bookings = fetchedBookings?.map(b => ({
            ...b,
            property: properties?.find(p => p.id === b.property_id)
        })) || []
    }

    // Stats
    const pendingCount = bookings?.filter((b: any) => b.status === 'pending').length || 0
    const confirmedCount = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
    const totalEarnings = bookings?.filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0B3D6F] tracking-tight">Reservations</h1>
                    <p className="text-muted-foreground mt-1">Manage incoming booking requests and guests.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-medium text-gray-600">
                    <Calendar className="w-4 h-4 text-[#F17720]" />
                    <span>Today is {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* Dashboard Stats (Premium Design) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-24 h-24 bg-[#F17720] rounded-full blur-2xl" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-orange-50 rounded-2xl text-[#F17720] shadow-sm">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                            <p className="text-4xl font-extrabold text-gray-900 mt-1">{pendingCount}</p>
                        </div>
                    </div>
                    {pendingCount > 0 && (
                        <div className="mt-4 inline-flex items-center text-sm font-medium text-[#F17720]">
                            Action required <div className="w-2 h-2 bg-[#F17720] rounded-full ml-2 animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-24 h-24 bg-green-500 rounded-full blur-2xl" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-green-50 rounded-2xl text-green-600 shadow-sm">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Confirmed</p>
                            <p className="text-4xl font-extrabold text-gray-900 mt-1">{confirmedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-[#0B3D6F] to-[#062a4d] p-6 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-shadow group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-32 h-32 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl text-white shadow-inner">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Expected Earnings</p>
                            <p className="text-4xl font-extrabold text-white mt-1">{totalEarnings.toLocaleString()} <span className="text-lg text-blue-200">TND</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings List with Tabs */}
            <div className="space-y-6">
                <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-[#F17720] rounded-full" />
                            <h2 className="text-2xl font-bold text-[#0B3D6F]">Bookings Management</h2>
                        </div>
                        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Upcoming</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="upcoming" className="space-y-4">
                        {bookings.filter((b: any) => {
                            const endDate = new Date(b.end_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return b.status === 'pending' || (b.status === 'confirmed' && endDate >= today);
                        }).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {bookings.filter((b: any) => {
                                    const endDate = new Date(b.end_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return b.status === 'pending' || (b.status === 'confirmed' && endDate >= today);
                                }).map((booking: any) => (
                                    booking.property && (
                                        <OwnerBookingCard key={booking.id} booking={booking} />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm text-center">
                                <div className="bg-blue-50 p-6 rounded-full mb-6">
                                    <Inbox className="w-12 h-12 text-[#0B3D6F]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming bookings</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    You don't have any active or pending reservations at the moment.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {bookings.filter((b: any) => {
                            const endDate = new Date(b.end_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return b.status === 'cancelled' || b.status === 'rejected' || (b.status === 'confirmed' && endDate < today);
                        }).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {bookings.filter((b: any) => {
                                    const endDate = new Date(b.end_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return b.status === 'cancelled' || b.status === 'rejected' || (b.status === 'confirmed' && endDate < today);
                                }).map((booking: any) => (
                                    booking.property && (
                                        <OwnerBookingCard key={booking.id} booking={booking} />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm text-center">
                                <div className="bg-gray-50 p-6 rounded-full mb-6">
                                    <Clock className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No booking history</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    Past reservations and cancelled bookings will appear here.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
