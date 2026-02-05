'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Check, X, MessageSquare, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BookingConfirmationDialog } from './booking-confirmation-dialog'

interface BookingCardProps {
    booking: any
}

export function OwnerBookingCard({ booking }: BookingCardProps) {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogAction, setDialogAction] = useState<'accept' | 'reject'>('accept')

    const handleStatusUpdate = async (newStatus: 'confirmed' | 'cancelled') => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', booking.id)

            if (error) throw error

            toast.success(`Booking ${newStatus === 'confirmed' ? 'accepted' : 'rejected'} successfully`)
            router.refresh()
        } catch (error: any) {
            toast.error("Failed to update: " + error.message)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const openDialog = (action: 'accept' | 'reject') => {
        setDialogAction(action)
        setDialogOpen(true)
    }

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Guest Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={booking.guest?.avatar_url} />
                    <AvatarFallback>{booking.guest?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-[#0B3D6F]">{booking.guest?.full_name || 'Guest'}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Contact Guest
                    </div>
                </div>
            </div>

            {/* Dates & Room */}
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-[#F17720]" />
                    {new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}
                    <span className="text-gray-400">|</span>
                    <span className="text-[#0B3D6F] font-bold">{booking.total_price} TND</span>
                </div>
                <div className="text-sm text-gray-500">
                    {booking.property?.title} • <span className="text-gray-700 font-semibold">{booking.room?.name}</span>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 justify-end">
                {booking.status === 'pending' && (
                    <>
                        <Button
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                            onClick={() => openDialog('reject')}
                            disabled={isLoading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => openDialog('accept')}
                            disabled={isLoading}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                        </Button>
                    </>
                )}

                {booking.status !== 'pending' && (
                    <Badge className={`
                        text-sm px-3 py-1 capitalize
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                        ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                    `}>
                        {booking.status}
                    </Badge>
                )}
            </div>

            {/* Confirmation Dialog */}
            <BookingConfirmationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                booking={booking}
                action={dialogAction}
                onConfirm={async () => {
                    await handleStatusUpdate(dialogAction === 'accept' ? 'confirmed' : 'cancelled')
                }}
            />
        </div>
    )
}
