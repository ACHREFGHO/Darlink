
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

let url, key;
try {
    const env = fs.readFileSync('.env.local', 'utf8')
    url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]
    key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]
} catch (e) { }

const supabase = createClient(url.trim(), key.trim())

async function check() {
    console.log("Simulating Home page query...")
    const { data: properties, error } = await supabase.from('properties').select(`
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
      ),
      property_amenities (
        amenity
      )
    `)
        .eq('status', 'Published')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('QUERY ERROR:', error)
    } else {
        console.log('Fetched properties count:', properties.length)
        if (properties.length > 0) {
            console.log('First property title:', properties[0].title)
            console.log('First property rooms:', properties[0].rooms)
        }
    }
}
check()
