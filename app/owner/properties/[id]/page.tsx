
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PropertyEditor } from "@/components/properties/property-editor"

interface PropertyPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PropertyManagePage({ params }: PropertyPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Property Details
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !property) {
        notFound()
    }

    // Verify ownership
    if (property.owner_id !== user.id) {
        redirect('/owner/dashboard')
    }

    // Fetch Images
    const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id)
        .order('display_order', { ascending: true })

    // Fetch Rooms
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', property.id)

    // Fetch Specs
    const { data: specs } = await supabase
        .from('property_specs')
        .select('category')
        .eq('property_id', property.id)

    // Fetch Amenities
    const { data: amenities } = await supabase
        .from('property_amenities')
        .select('amenity')
        .eq('property_id', property.id)

    // Construct full data object
    const fullData = {
        ...property,
        images: [], // New file uploads start empty
        existing_images: images || [],
        rooms: rooms || [],
        specs: specs?.map(s => s.category) || [],
        amenities: amenities?.map(a => a.amenity) || []
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0B3D6F]">Manage Property</h1>
                <p className="text-muted-foreground">{property.title}</p>
            </div>

            <PropertyEditor
                initialData={fullData}
                propertyId={property.id}
                key={JSON.stringify(fullData)} // Force remount when data changes
            />
        </div>
    )
}
