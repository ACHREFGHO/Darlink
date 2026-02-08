'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signOutAction() {
    const supabase = await createClient()

    // 1. Sign out from Supabase (revokes session on server)
    await supabase.auth.signOut()

    // 2. Fallback: Manually clear the supabase-auth-token cookies just in case
    // Next.js actions allow modifying cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Supabase cookies usually follow a pattern like sb-<id>-auth-token
    allCookies.forEach(cookie => {
        if (cookie.name.includes('auth-token') || cookie.name.includes('supabase')) {
            cookieStore.delete(cookie.name)
        }
    })

    // 3. Clear the cache and redirect
    redirect('/')
}
