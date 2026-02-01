import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function OwnerPropertiesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0B3D6F]">My Properties</h1>
                    <p className="text-muted-foreground">Manage your property listings.</p>
                </div>
                <Button asChild className="bg-[#F17720] hover:bg-[#d1661b] text-white">
                    <Link href="/owner/properties/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                {properties?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
                        <Link href="/owner/properties/new">
                            <Button variant="outline" className="border-[#F17720] text-[#F17720]">Create Listing</Button>
                        </Link>
                    </div>
                ) : (
                    properties?.map((property) => (
                        <div key={property.id} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                {property.main_image_url ? (
                                    <img src={property.main_image_url} alt={property.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-lg text-[#0B3D6F]">{property.title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${property.status === 'Published' ? 'bg-green-100 text-green-700' :
                                            property.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{property.city}, {property.governorate}</p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{property.description}</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/owner/properties/${property.id}`}>Edit</Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Delete</Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
