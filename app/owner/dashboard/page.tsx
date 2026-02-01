
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OwnerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Since layout protects this, user should exist, but let's be safe
    if (!user) return null

    // Fetch properties count
    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)

    const propertyCount = properties?.length || 0
    const publishedCount = properties?.filter(p => p.status === 'Published').length || 0
    const pendingCount = properties?.filter(p => p.status === 'Pending').length || 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B3D6F]">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, manage your properties and bookings.</p>
                </div>
                <Button asChild className="bg-[#F17720] hover:bg-[#d1661b] text-white">
                    <Link href="/owner/properties/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0B3D6F]">{propertyCount}</div>
                        <p className="text-xs text-muted-foreground">{publishedCount} published</p>
                    </CardContent>
                </Card>

                {/* Placeholder Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F17720]">{pendingCount}</div>
                    </CardContent>
                </Card>

                {/* Reservations Stats */}
                <Link href="/owner/bookings" className="block">
                    <Card className="hover:border-[#F17720] transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reservations</CardTitle>
                            <div className="h-4 w-4 text-[#F17720]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#0B3D6F]">View All</div>
                            <p className="text-xs text-muted-foreground">Manage your bookings</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Properties Table / List */}
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#0B3D6F]">Your Properties</h3>
                    <div className="mt-4">
                        {propertyCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="bg-gray-100 p-4 rounded-full mb-3">
                                    <Building className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-lg">No properties yet</h3>
                                <p className="text-muted-foreground mb-4 max-w-sm">
                                    Start earning by listing your house, apartment or guesthouse on DARLINK.
                                </p>
                                <Button asChild variant="outline" className="border-[#F17720] text-[#F17720] hover:bg-[#F17720] hover:text-white">
                                    <Link href="/owner/properties/new">
                                        Create First Listing
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {properties?.map(property => (
                                    <div key={property.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-16 bg-gray-200 rounded overflow-hidden relative">
                                                {property.main_image_url ? (
                                                    <img src={property.main_image_url} alt="" className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{property.title}</p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full ${property.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                        property.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {property.status}
                                                    </span>
                                                    <span className="text-muted-foreground">{property.city}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/owner/properties/${property.id}`}>Manage</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
