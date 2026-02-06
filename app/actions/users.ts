'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string) {
    const supabase = await createClient()

    // 1. Auth check (Admin only)
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) return { success: false, error: "Not authenticated" }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
        return { success: false, error: "Unauthorized access" }
    }

    // 2. Perform Update
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

    if (error) {
        console.error("Error updating user role:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
