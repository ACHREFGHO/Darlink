
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Try to read .env.local manually
let url, key;
try {
    const env = fs.readFileSync('.env.local', 'utf8')
    url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]
    key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]
} catch (e) {
    console.error("Could not read .env.local")
}

if (!url || !key) {
    console.error("Missing credentials")
    process.exit(1)
}

const supabase = createClient(url.trim(), key.trim())

async function check() {
    console.log("Checking properties table...")
    const { data, error } = await supabase.from('properties').select('id, title, status')
    if (error) {
        console.error('Error fetching properties:', error)
    } else {
        console.log('Total properties found:', data.length)
        console.log('Statuses:', data.map(p => p.status))
    }

    console.log("Checking amenities table...")
    const { data: am, error: amError } = await supabase.from('property_amenities').select('*', { count: 'exact', head: true })
    if (amError) {
        console.error('Property amenities table check failed:', amError.message)
    } else {
        console.log('Property amenities table exists.')
    }
}

check()
