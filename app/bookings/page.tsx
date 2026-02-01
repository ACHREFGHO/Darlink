
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDate } from "date-fns"
import { Calendar, MapPin, CreditCard, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { ReviewModal } from '@/components/reviews/review-modal'

export default async function MyBookingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            property:properties(id, title, city, main_image_url),
            room:rooms(name),
            reviews(rating, comment)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-[#0B3D6F]">
                        DARLINK<span className="text-[#F17720]">.tn</span>
                    </Link>
                    <nav className="flex gap-4">
                        <Link href="/">
                            <Button variant="ghost">Find Stays</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold text-[#0B3D6F] mb-2">My Trips</h1>
                <p className="text-muted-foreground mb-8">Manage your upcoming and past reservations.</p>

                {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking: any) => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 relative">
                                    {booking.property?.main_image_url ? (
                                        <img
                                            src={booking.property.main_image_url}
                                            alt={booking.property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">No Image</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-[#0B3D6F]">{booking.property?.title}</h3>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {booking.property?.city}
                                                </div>
                                            </div>
                                            <Badge className={`
                                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                                ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                            `}>
                                                {booking.status}
                                            </Badge>
                                        </div>

                                        <div className="text-sm font-medium text-gray-700 mt-2">
                                            {booking.room?.name} | {booking.trip_purpose || 'Leisure'}
                                        </div>
                                    </div>

                                    {/* Dates & Price */}
                                    <div className="flex flex-col justify-between items-start md:items-end gap-4 min-w-[200px]">
                                        <div className="space-y-1 text-right w-full">
                                            <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-[#F17720]" />
                                                <span>{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                                                <CreditCard className="w-4 h-4 text-[#F17720]" />
                                                <span className="font-bold text-[#0B3D6F]">{booking.total_price} TND</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto justify-end">
                                            {booking.status === 'confirmed' && (
                                                <ReviewModal
                                                    bookingId={booking.id}
                                                    propertyId={booking.property?.id}
                                                    userId={user.id}
                                                    existingReview={booking.reviews?.[0]}
                                                />
                                            )}
                                            <Link href={`/properties/${booking.property?.id}`}>
                                                <Button variant="outline" size="sm">View Property</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-[#F17720]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No trips booked... yet!</h3>
                        <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Time to dust off your bags and start planning your next adventure.</p>
                        <Link href="/">
                            <Button className="bg-[#0B3D6F] text-white hover:bg-[#092d52]">Start Exploring</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
