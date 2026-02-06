import { createClient } from '@/lib/supabase/server'
import { SearchClient } from './search-client'
import { redirect } from 'next/navigation'

export default async function SearchPage() {
    const supabase = await createClient()

    // Fetch user and role
    const { data: { user } } = await supabase.auth.getUser()

    let userRole = 'client'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile) {
            userRole = profile.role
        }
    }

    // Fetch all published properties with their relations
    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (
                image_url,
                display_order
            ),
            rooms (
                price_per_night,
                max_guests,
                beds,
                name
            ),
            property_specs (
                category
            ),
            reviews (
                rating
            )
        `)
        .eq('status', 'Published')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching properties:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
    }

    // Fetch favorites if user is logged in
    let favoriteIds: string[] = []
    if (user) {
        const { data: favorites } = await supabase
            .from('favorites')
            .select('property_id')
            .eq('user_id', user.id)

        if (favorites) {
            favoriteIds = favorites.map(f => f.property_id)
        }
    }

    return (
        <SearchClient
            properties={properties || []}
            user={user}
            userRole={userRole}
            favoriteIds={favoriteIds}
        />
    )
}
