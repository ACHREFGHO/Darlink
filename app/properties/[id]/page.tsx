
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PropertyDetailsClient } from './property-details-client'

interface PropertyPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Get Current User
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Property Details
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (
                image_url,
                display_order
            )
        `)
        .eq('id', id)
        .single()

    if (error || !property) {
        notFound()
    }

    // Fetch Owner Profile
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', property.owner_id)
        .single()

    // Fetch Rooms
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', property.id)

    // Fetch Specifications
    const { data: specs } = await supabase
        .from('property_specs')
        .select('*')
        .eq('property_id', property.id)

    // Fetch Amenities
    const { data: amenities } = await supabase
        .from('property_amenities')
        .select('*')
        .eq('property_id', property.id)

    // Check if favorited
    let isFavorited = false
    if (user) {
        const { data: fav } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('property_id', property.id)
            .single()
        if (fav) isFavorited = true
    }

    // Fetch Reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })

    // Fetch Average Ratings
    const { data: ratingInfo } = await supabase
        .from('property_ratings')
        .select('*')
        .eq('property_id', property.id)
        .single()

    // Check if user has a confirmed booking that hasn't been reviewed yet
    let canReview = false
    if (user) {
        const { data: bookings } = await supabase
            .from('bookings')
            .select(`
                id,
                reviews (id)
            `)
            .eq('user_id', user.id)
            .eq('property_id', property.id)
            .eq('status', 'confirmed')

        if (bookings && bookings.length > 0) {
            // Can review if there is at least one confirmed booking that does NOT have a review yet
            canReview = bookings.some(b => !b.reviews || (Array.isArray(b.reviews) && b.reviews.length === 0))
        }
    }

    return (
        <PropertyDetailsClient
            property={property}
            user={user}
            propertySpecs={specs?.[0]}
            propertyRooms={rooms || []}
            propertyAmenities={amenities || []}
            ownerProfile={ownerProfile}
            isFavorited={isFavorited}
            reviews={reviews || []}
            ratingInfo={ratingInfo}
            canReview={canReview}
        />
    )
}
