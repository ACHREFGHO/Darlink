'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: {
    full_name?: string
    phone?: string
    avatar_url?: string
}) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // 2. Perform Update
    const { error } = await supabase
        .from('profiles')
        .update({
            ...formData,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/account')

    // 3. Sync with Auth Metadata (for Navbar/other layouts)
    if (formData.full_name || formData.avatar_url) {
        await supabase.auth.updateUser({
            data: {
                full_name: formData.full_name,
                avatar_url: formData.avatar_url
            }
        })
    }

    return { success: true }
}
