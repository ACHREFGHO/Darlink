import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Plus, ArrowUpRight, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardCharts } from "@/components/owner/dashboard-charts"
import { startOfToday, subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

export default async function OwnerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Fetch Basic Totals
    const { data: properties } = await supabase
        .from('properties')
        .select('*, rooms(price_per_night, units_count)')
        .eq('owner_id', user.id)

    const propertyCount = properties?.length || 0
    const publishedCount = properties?.filter(p => p.status === 'Published').length || 0
    const pendingCount = properties?.filter(p => p.status === 'Pending').length || 0

    // 2. Fetch Views Stats
    const today = startOfToday()
    const yesterday = subDays(today, 1)

    const { data: viewsData } = await supabase
        .from('property_views')
        .select('viewed_at, property_id')
        .in('property_id', properties?.map(p => p.id) || [])

    const todayViews = viewsData?.filter(v => new Date(v.viewed_at) >= today).length || 0
    const yesterdayViews = viewsData?.filter(v => {
        const d = new Date(v.viewed_at)
        return d >= yesterday && d < today
    }).length || 0

    // Prepare chart data for last 7 days views
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i)
        return {
            name: format(d, 'EEE'),
            views: viewsData?.filter(v => format(new Date(v.viewed_at), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length || 0
        }
    })

    // 3. Fetch Bookings & Earnings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('property_id', properties?.map(p => p.id) || [])
        .eq('status', 'confirmed')

    const totalEarnings = bookings?.reduce((acc, b) => acc + Number(b.total_price), 0) || 0

    // Revenue over last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subDays(today, (5 - i) * 30)
        const monthStart = startOfMonth(d)
        const monthEnd = endOfMonth(d)
        return {
            name: format(d, 'MMM'),
            amount: bookings?.filter(b => {
                const bDate = new Date(b.start_date)
                return bDate >= monthStart && bDate <= monthEnd
            }).reduce((acc, b) => acc + Number(b.total_price), 0) || 0
        }
    })

    // 4. Occupancy Calculation
    const thirtyDaysAgo = subDays(today, 30)
    let totalUnitNights = 0
    properties?.forEach(p => {
        const roomsTotalUnits = p.rooms?.reduce((acc: number, r: any) => acc + (r.units_count || 1), 0) || 0
        totalUnitNights += roomsTotalUnits * 30
    })

    let bookedNights = 0
    bookings?.forEach(b => {
        const start = new Date(b.start_date)
        const end = new Date(b.end_date)
        const days = eachDayOfInterval({ start, end })
        const nightsInPeriod = days.filter(d => d >= thirtyDaysAgo && d <= today).length - 1
        bookedNights += Math.max(0, nightsInPeriod)
    })

    const occupancyRate = totalUnitNights > 0
        ? Math.min(100, Math.round((bookedNights / totalUnitNights) * 100))
        : 0

    const upcomingBookingsCount = bookings?.filter(b => new Date(b.start_date) > today).length || 0

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-[#0B3D6F]">Performance</h1>
                    <p className="text-muted-foreground font-medium mt-1">Real-time insights for your properties.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" className="rounded-2xl border-2 hover:bg-slate-50">
                        <Link href="/owner/properties">
                            Manage Listings
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#F17720] hover:bg-[#d1661b] text-white rounded-2xl px-6 font-bold shadow-lg shadow-orange-200">
                        <Link href="/owner/properties/new">
                            <Plus className="mr-2 h-5 w-5" /> Add Property
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Performance Charts */}
            <DashboardCharts
                viewsData={last7Days}
                revenueData={last6Months}
                occupancy={occupancyRate}
                stats={{
                    viewsToday: todayViews,
                    viewsYesterday: yesterdayViews,
                    totalEarnings: totalEarnings,
                    upcomingBookings: upcomingBookingsCount
                }}
            />

            {/* Recent Items Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Properties List */}
                <Card className="xl:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black text-[#0B3D6F]">Your Listings</CardTitle>
                            <Link href="/owner/properties" className="text-[#F17720] text-sm font-bold flex items-center hover:underline">
                                View All <ArrowUpRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {propertyCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                                <div className="bg-slate-100 p-6 rounded-3xl mb-4">
                                    <Building className="h-12 w-12 text-slate-300" />
                                </div>
                                <h3 className="font-bold text-xl text-[#0B3D6F]">No properties yet</h3>
                                <p className="text-slate-400 mb-8 max-w-xs">
                                    Start earning by listing your first property on Tunisia's premium marketplace.
                                </p>
                                <Button asChild className="bg-[#0B3D6F] rounded-2xl px-8 h-14 font-bold">
                                    <Link href="/owner/properties/new">Create Listing</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {properties?.slice(0, 5).map(property => (
                                    <div key={property.id} className="flex items-center justify-between p-6 hover:bg-slate-50 group transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="h-20 w-28 bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
                                                {property.main_image_url ? (
                                                    <img src={property.main_image_url} alt="" className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 pb-1">
                                                        <Building className="w-8 h-8 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0B3D6F] text-lg leading-tight mb-1">{property.title}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${property.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                            property.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {property.status}
                                                    </span>
                                                    <span className="text-slate-400 text-xs font-medium">{property.city}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-[#0B3D6F] hover:bg-white">
                                            <Link href={`/owner/properties/${property.id}`}>Edit Details</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Summary */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0B3D6F] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Building className="w-24 h-24" />
                        </div>
                        <CardHeader className="p-8">
                            <CardTitle className="text-white/60 text-sm font-bold uppercase tracking-widest">Inventory Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                    <span className="text-white font-medium">Published</span>
                                    <span className="text-3xl font-black">{publishedCount}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                    <span className="text-white/60 font-medium font-medium">Pending Review</span>
                                    <span className="text-3xl font-black text-[#F17720]">{pendingCount}</span>
                                </div>
                                <Button asChild className="w-full bg-[#F17720] hover:bg-white hover:text-[#F17720] transition-all h-14 rounded-2xl font-black text-lg shadow-xl shadow-black/20">
                                    <Link href="/owner/properties">Manage All</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Link href="/owner/bookings" className="block group">
                        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white hover:shadow-2xl transition-all p-8 relative overflow-hidden h-full">
                            <div className="flex flex-col gap-4">
                                <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center text-[#F17720] group-hover:scale-110 transition-transform">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-[#0B3D6F]">Reservations</h4>
                                    <p className="text-slate-400 font-medium">Manage and confirm bookings</p>
                                </div>
                                <div className="pt-4 flex items-center text-[#F17720] font-black text-sm uppercase tracking-wider">
                                    Go to Bookings <ArrowUpRight className="ml-2 w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
