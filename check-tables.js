
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
    const tables = ['properties', 'rooms', 'property_images', 'property_specs', 'property_amenities', 'favorites', 'reviews', 'profiles']
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*', { count: 'exact', head: true })
        if (error) {
            console.log(`TABLE ${t}: ERROR ${error.message}`)
        } else {
            console.log(`TABLE ${t}: OK`)
        }
    }
}
check()
