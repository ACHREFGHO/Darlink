import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, ShieldCheck, Clock } from "lucide-react"
import { PropertyActions } from "@/components/admin/property-actions"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch quick stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: propertyCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
    const { count: pendingCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'Pending')

    // Fetch recent pending properties
    const { data: recentPending } = await supabase
        .from('properties')
        .select('*, profiles(full_name, email)')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{propertyCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-[#F17720]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F17720]">{pendingCount || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Pending Property Approvals</h2>

                {recentPending && recentPending.length > 0 ? (
                    <div className="rounded-md border bg-white">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Property</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {recentPending.map((prop) => (
                                        <tr key={prop.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{prop.title}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span>{prop.profiles?.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{prop.profiles?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{prop.city}, {prop.governorate}</td>
                                            <td className="p-4 align-middle">{new Date(prop.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle text-right">
                                                <PropertyActions
                                                    propertyId={prop.id}
                                                    ownerId={prop.owner_id}
                                                    propertyTitle={prop.title}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed">
                        <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-muted-foreground">No pending properties found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
