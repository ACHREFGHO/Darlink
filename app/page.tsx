import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { LogIn, LayoutDashboard, Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PropertyCardListing } from '@/components/properties/property-card-listing'

import { SearchBar } from '@/components/site/search-bar'

export default async function Home({ searchParams }: { searchParams: Promise<{ location?: string, guests?: string }> }) {
  const supabase = await createClient()
  const { location, guests } = await searchParams

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Get Profile Role if User exists
  let userRole = 'client'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role
  }

  // 3. Build Query
  let query = supabase.from('properties').select(`
      *,
      property_images (
        image_url,
        display_order
      ),
      rooms (
        price_per_night,
        max_guests
      )
    `)
    .eq('status', 'Published')
    .order('created_at', { ascending: false })

  // Apply Filters
  if (location) {
    query = query.or(`city.ilike.%${location}%,governorate.ilike.%${location}%`)
  }

  // If guests filter is active, we need to ensure at least one room has enough capacity
  // We use !inner to enforce the filter on the joined table relationship
  if (guests) {
    // Re-define select to use inner join for filtering if guests is present
    // Note: supabase query builder chaining can be tricky with changing selects. 
    // Easier strategy: Always select, but add filter. 
    // However, filtering on related table requires the inner join syntax in the select or a separate filter.
    // PostgREST syntax: properties?select=*,rooms!inner(*)&rooms.max_guests=gte.3

    // Let's rebuild the query slightly differently to handle the !inner join correctly
    query = supabase.from('properties').select(`
      *,
      property_images (
        image_url,
        display_order
      ),
      rooms!inner (
        price_per_night,
        max_guests
      )
    `)
      .eq('status', 'Published')
      .order('created_at', { ascending: false })

    if (location) {
      query = query.or(`city.ilike.%${location}%,governorate.ilike.%${location}%`)
    }

    query = query.gte('rooms.max_guests', guests)
  }

  const { data: properties } = await query

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full transition-all duration-300 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link className="flex items-center gap-2 group transition-opacity hover:opacity-90" href="/">
            <div className="relative h-12 w-auto">
              <img
                src="/images/logo_darlink.png"
                alt="DARLINK Logo"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {userRole === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button size="sm" className="bg-[#B88746] text-white hover:bg-[#a6793f] shadow-lg">
                      Admin Portal
                    </Button>
                  </Link>
                )}
                {(userRole === 'house_owner' || userRole === 'admin') && (
                  <Link href="/owner/dashboard">
                    <Button variant="ghost" className="text-white hover:bg-white/20 gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/bookings">
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    My Trips
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" size="sm">Sign Out</Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-[#F17720] text-white hover:bg-[#d1661b] rounded-full px-6 shadow-lg hover:shadow-xl transition-all">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/beach-house.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0B3D6F]/90" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8 pt-20">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                Authentic Stays.<br />
                <span className="text-[#F17720]">Unforgettable Memories.</span>
              </h1>
              <p className="max-w-[700px] mx-auto text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
                Discover the hidden gems of Tunisia, from luxurious villas in Hammamet to cozy guesthouses in Sidi Bou Said.
              </p>
            </div>

            {/* Search Bar Visual */}
            <div className="w-full max-w-5xl">
              <SearchBar />
            </div>
          </div>
        </section>

        {/* Featured Properties Grid */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0B3D6F]">Featured Stays</h2>
                <p className="text-muted-foreground mt-2 text-lg">Handpicked properties for your next adventure</p>
              </div>
              <Link href="/search" className="hidden md:flex items-center text-[#F17720] font-semibold hover:gap-2 transition-all">
                View all listings <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {properties.map((property, index) => (
                  <PropertyCardListing key={property.id} property={property} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                <div className="bg-[#F17720]/10 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-[#F17720]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No stays found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any published properties at the moment. Check back soon for new listings!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full bg-[#0B3D6F] text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="h-10 w-auto flex items-center">
              <img src="/images/logo_darlink.png" alt="Logo" className="h-full object-contain brightness-0 invert" />
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              The premier marketplace for vacation rentals in Tunisia. Experience authentic stays and create unforgettable memories.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Platform</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Browse Stays</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Become a Host</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Newsletter</h4>
            <p className="text-blue-200 text-sm mb-4">Subscribe to get special offers and updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-blue-300 w-full focus:outline-none focus:border-[#F17720]" />
              <Button className="bg-[#F17720] hover:bg-[#d1661b]">&rarr;</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-blue-300">
          <p>© 2026 DARLINK. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
