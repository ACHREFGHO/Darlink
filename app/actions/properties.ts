'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePropertyLocation(propertyId: string, latitude: number, longitude: number) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('properties')
            .update({ latitude, longitude })
            .eq('id', propertyId)

        if (error) {
            console.error('Error updating property location:', error)
            return { success: false, error: error.message }
        }

        revalidatePath(`/properties/${propertyId}`)
        revalidatePath('/') // Revalidate home page to show on map

        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
export async function deleteProperty(propertyId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId)

        if (error) {
            console.error('Error deleting property:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/owner/properties')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function trackPropertyView(propertyId: string, userId?: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('property_views')
            .insert({
                property_id: propertyId,
                viewer_id: userId
            })

        if (error) {
            // Silently fail to not break user experience
            console.error('Error tracking view:', error)
        }
    } catch (error) {
        console.error('Unexpected error tracking view:', error)
    }
}
