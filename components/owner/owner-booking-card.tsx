'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Check, X, MessageSquare, Phone, ExternalLink, Hash, Home } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BookingConfirmationDialog } from './booking-confirmation-dialog'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'

interface BookingCardProps {
    booking: any
}

export function OwnerBookingCard({ booking }: BookingCardProps) {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogAction, setDialogAction] = useState<'accept' | 'reject'>('accept')

    const startDate = new Date(booking.start_date)
    const endDate = new Date(booking.end_date)
    const nights = differenceInDays(endDate, startDate)

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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden group">
            <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">

                {/* 1. Guest Profile Section */}
                <div className="flex items-center gap-5 min-w-[240px]">
                    <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-xl">
                            <AvatarImage src={booking.guest?.avatar_url} />
                            <AvatarFallback className="bg-slate-100 text-[#0B3D6F] font-black text-xl">
                                {booking.guest?.full_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${booking.status === 'confirmed' ? 'bg-green-500' :
                            booking.status === 'pending' ? 'bg-orange-400 animate-pulse' :
                                'bg-slate-300'
                            }`} />
                    </div>
                    <div>
                        <h3 className="font-black text-[#0B3D6F] text-lg leading-tight uppercase tracking-tight">{booking.guest?.full_name || 'Anonymous Guest'}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {booking.guest?.phone && (
                                <a href={`tel:${booking.guest.phone}`} className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                </a>
                            )}
                            <a href={`mailto:${booking.guest?.email}`} className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* 2. Divider (Desktop Only) */}
                <div className="hidden xl:block h-12 w-px bg-slate-100" />

                {/* 3. Booking Details Center */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <Calendar className="w-4 h-4 text-[#F17720]" />
                            <span className="text-sm font-bold text-slate-700">
                                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                            </span>
                            <Badge variant="outline" className="ml-2 bg-white text-[#F17720] border-orange-100 font-black">
                                {nights || 1} NIGHTS
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-[#0B3D6F] font-black text-xl">
                            {booking.total_price?.toLocaleString()} <span className="text-xs text-slate-400 font-bold">TND</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <Link href={`/properties/${booking.property_id}`} className="text-sm text-slate-500 hover:text-[#0B3D6F] flex items-center gap-1.5 transition-colors font-medium group/link">
                            <Home className="w-4 h-4 text-[#F17720]" />
                            {booking.property?.title}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                        <div className="text-sm text-slate-400 flex items-center gap-1.5 font-medium">
                            <Hash className="w-4 h-4" />
                            {booking.room?.name || 'Standard Room'}
                            {booking.units_booked > 1 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-orange-50 text-[#F17720] rounded-md font-black text-[10px]">
                                    x{booking.units_booked}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Action / Status Section */}
                <div className="flex items-center gap-3 w-full xl:w-auto self-stretch xl:self-center justify-end">
                    {booking.status === 'pending' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                id={`reject-${booking.id}`}
                                className="flex-1 sm:flex-none h-12 rounded-2xl border-2 border-red-50 text-red-500 hover:bg-red-50 font-bold transition-all px-6"
                                onClick={() => openDialog('reject')}
                                disabled={isLoading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                            </Button>
                            <Button
                                id={`accept-${booking.id}`}
                                className="flex-1 sm:flex-none h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-100 transition-all px-8"
                                onClick={() => openDialog('accept')}
                                disabled={isLoading}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Accept Request
                            </Button>
                        </div>
                    )}

                    {booking.status !== 'pending' && (
                        <div className={`
                            flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest
                            ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-100' : ''}
                            ${booking.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-100' : ''}
                            ${booking.status === 'rejected' ? 'bg-slate-50 text-slate-400 border border-slate-100' : ''}
                        `}>
                            <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' :
                                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-400'
                                }`} />
                            {booking.status}
                        </div>
                    )}
                </div>
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
