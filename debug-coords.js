
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
    const { data, error } = await supabase.from('properties').select('id, title, city, status, latitude, longitude')
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Properties:', data.map(p => ({
            title: p.title,
            status: p.status,
            lat: p.latitude,
            lng: p.longitude
        })))
    }
}
check()
