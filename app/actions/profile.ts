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
    return { success: true }
}
