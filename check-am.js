
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
    try {
        const { data, error } = await supabase.from('property_amenities').select('id').limit(1)
        if (error) {
            console.log('AMENITIES_ERROR:', error.message)
        } else {
            console.log('AMENITIES_OK: Table exists')
        }
    } catch (e) {
        console.log('AMENITIES_CRASH:', e.message)
    }
}
check()
