'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveProperty(propertyId: string, ownerId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Unauthorized: Admin only")

    // 2. Approve Property
    const { error: propError } = await supabase
        .from('properties')
        .update({ status: 'Published' })
        .eq('id', propertyId)

    if (propError) throw propError

    // 3. Promote User to 'house_owner' if they are just a 'client'
    // This allows them to see the Owner Dashboard properly
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', ownerId)
        .single()

    if (ownerProfile?.role === 'client') {
        await supabase
            .from('profiles')
            .update({ role: 'house_owner', is_approved: true })
            .eq('id', ownerId)
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/owner/dashboard')
    revalidatePath('/')
}

export async function rejectProperty(propertyId: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Unauthorized: Admin only")

    // Reject Property
    const { error } = await supabase
        .from('properties')
        .update({ status: 'Rejected' })
        .eq('id', propertyId)

    if (error) throw error

    revalidatePath('/admin/dashboard')
}
