import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error("Supabase Environment Variables are missing!")
        console.log("URL:", supabaseUrl)
        console.log("Key:", supabaseKey ? "Set (Hidden)" : "Not Set")
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseKey!
    )
}
