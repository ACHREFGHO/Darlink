import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/site/navbar'
import { PropertyCardListing } from '@/components/properties/property-card-listing'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Heart } from 'lucide-react'

export default async function FavoritesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get Profile for Navbar
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const userRole = profile?.role || 'client'

    // Fetch Favorites
    const { data: favorites } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)

    const propertyIds = favorites?.map(f => f.property_id) || []

    // Fetch Properties
    let properties: any[] = []
    if (propertyIds.length > 0) {
        const { data } = await supabase
            .from('properties')
            .select(`
        *,
        property_images (
          image_url,
          display_order
        ),
        rooms (
          price_per_night,
          max_guests
        ),
        property_specs (
          category
        )
      `)
            .in('id', propertyIds)
            .eq('status', 'Published')

        properties = data || []
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={user} userRole={userRole} variant="inner" />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0B3D6F] flex items-center gap-2">
                        <Heart className="w-8 h-8 text-[#F17720] fill-[#F17720]" />
                        Your Wishlist
                    </h1>
                    <p className="text-gray-500 mt-2">Properties you have saved for later.</p>
                </div>

                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {properties.map((property, index) => (
                            <PropertyCardListing
                                key={property.id}
                                property={property}
                                index={index}
                                isFavorited={true} // Since we are in favorites page, they are all favorited
                                userId={user.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                        <div className="bg-[#F17720]/10 p-4 rounded-full mb-4">
                            <Heart className="w-8 h-8 text-[#F17720]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            Start exploring and save your favorite stays here.
                        </p>
                        <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#F17720] text-white hover:bg-[#d1661b] h-10 px-4 py-2">
                            Explore Stays <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
