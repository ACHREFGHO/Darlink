import { createClient } from '@/lib/supabase/server'
import { HomeClient } from '@/app/home-client'

export default async function Home({ searchParams }: { searchParams: Promise<{ location?: string, guests?: string, type?: string, category?: string }> }) {
  const supabase = await createClient()
  const { location, guests, type, category } = await searchParams

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Get Profile Role if User exists
  let userRole = 'client'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role
  }

  // 3. Build Query
  // specific selects for relations to allow filtering
  const roomSelect = guests ? 'rooms!inner' : 'rooms'
  const specSelect = category ? 'property_specs!inner' : 'property_specs'

  let query = supabase.from('properties').select(`
      *,
      property_images (
        image_url,
        display_order
      ),
      ${roomSelect} (
        price_per_night,
        max_guests
      ),
      ${specSelect} (
        category
      )
    `)
    .eq('status', 'Published')
    .order('created_at', { ascending: false })

  // Apply Filters
  if (location) {
    query = query.or(`city.ilike.%${location}%,governorate.ilike.%${location}%`)
  }

  if (guests) {
    query = query.gte('rooms.max_guests', guests)
  }

  if (type) {
    query = query.eq('type', type)
  }

  if (category) {
    query = query.eq('property_specs.category', category)
  }

  // 4. Get User Favorites
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

  const { data: properties } = await query

  return (
    <HomeClient
      properties={properties || []}
      user={user}
      userRole={userRole}
      favoriteIds={favoriteIds}
    />
  )
}
