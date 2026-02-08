import { createClient } from '@/lib/supabase/server'

export interface AvailabilityCheckParams {
    propertyId: string
    checkInDate: Date
    checkOutDate: Date
}

export interface AvailabilityResult {
    propertyId: string
    isAvailable: boolean
    conflictingBooking?: {
        id: string
        checkInDate: Date
        checkOutDate: Date
    }
}

/**
 * Check if a property is available for the given date range
 * by querying the bookings table for any overlapping reservations
 */
export async function checkPropertyAvailability({
    propertyId,
    checkInDate,
    checkOutDate
}: AvailabilityCheckParams): Promise<AvailabilityResult> {
    const supabase = await createClient()

    // Query for conflicting bookings
    // A booking conflicts if:
    // - It hasn't been cancelled
    // - check_in_date < checkOutDate AND check_out_date > checkInDate
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, check_in_date, check_out_date')
        .eq('property_id', propertyId)
        .neq('status', 'cancelled')
        .lt('check_in_date', checkOutDate.toISOString())
        .gt('check_out_date', checkInDate.toISOString())

    if (error) {
        console.error('Error checking availability:', error)
        return {
            propertyId,
            isAvailable: true, // Default to available if there's an error
        }
    }

    if (bookings && bookings.length > 0) {
        return {
            propertyId,
            isAvailable: false,
            conflictingBooking: {
                id: bookings[0].id,
                checkInDate: new Date(bookings[0].check_in_date),
                checkOutDate: new Date(bookings[0].check_out_date),
            }
        }
    }

    return {
        propertyId,
        isAvailable: true,
    }
}

/**
 * Check availability for multiple properties
 */
export async function checkMultiplePropertiesAvailability(
    propertyIds: string[],
    checkInDate: Date,
    checkOutDate: Date
): Promise<Map<string, boolean>> {
    const supabase = await createClient()

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('property_id, check_in_date, check_out_date')
        .in('property_id', propertyIds)
        .neq('status', 'cancelled')
        .lt('check_in_date', checkOutDate.toISOString())
        .gt('check_out_date', checkInDate.toISOString())

    if (error) {
        console.error('Error checking availability:', error)
        // Return all as available if there's an error
        const result = new Map<string, boolean>()
        propertyIds.forEach(id => result.set(id, true))
        return result
    }

    // Create a set of unavailable property IDs
    const unavailableIds = new Set(
        bookings?.map(b => b.property_id) || []
    )

    // Return availability for all properties
    const result = new Map<string, boolean>()
    propertyIds.forEach(id => {
        result.set(id, !unavailableIds.has(id))
    })

    return result
}

/**
 * Get the next available date after a booking conflict
 */
export function getNextAvailableDate(conflictingBooking: { checkOutDate: Date }): Date {
    return new Date(conflictingBooking.checkOutDate)
}

/**
 * Format date range for display
 */
export function formatDateRange(from: Date, to: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const fromStr = from.toLocaleDateString('en-US', options)
    const toStr = to.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${fromStr} - ${toStr}`
}
