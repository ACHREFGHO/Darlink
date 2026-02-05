'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(userId: string, propertyId: string, isFavorite: boolean) {
    const supabase = await createClient()

    try {
        if (isFavorite) {
            // Remove from favorites
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('property_id', propertyId)

            if (error) throw error
        } else {
            // Add to favorites
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: userId, property_id: propertyId })

            if (error) throw error
        }

        revalidatePath('/') // Revalidate home
        revalidatePath('/favorites')
        return { success: true }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        return { success: false, error: 'Failed to toggle favorite' }
    }
}
