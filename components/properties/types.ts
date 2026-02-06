
export type PropertyFormData = {
    // Step 1
    title: string
    description: string
    type: 'House' | 'Apartment' | 'Guesthouse'
    address: string
    city: string
    governorate: string
    main_image_url: string
    latitude?: number
    longitude?: number
    images: { file: File, caption: string }[]
    existing_images?: { id: string, image_url: string, caption?: string }[]
    deleted_image_ids?: string[]

    // Step 2
    rooms: {
        name: string
        price_per_night: number
        beds: number
        max_guests: number
        units_count: number
    }[]

    // Step 3
    specs: string[]
}
