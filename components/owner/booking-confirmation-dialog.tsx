'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react'

interface BookingConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: any
    action: 'accept' | 'reject'
    onConfirm: () => Promise<void>
}

export function BookingConfirmationDialog({
    open,
    onOpenChange,
    booking,
    action,
    onConfirm
}: BookingConfirmationDialogProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [isLoading, setIsLoading] = useState(false)

    const handleFirstConfirm = () => {
        setStep(2)
    }

    const handleFinalConfirm = async () => {
        setIsLoading(true)
        try {
            await onConfirm()
            onOpenChange(false)
            setStep(1)
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setStep(1)
        onOpenChange(false)
    }

    const isAccept = action === 'accept'
    const guest = booking?.guest

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) {
                setStep(1)
            }
            onOpenChange(open)
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        {isAccept ? (
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        ) : (
                            <div className="p-2 bg-red-50 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        )}
                        <span className={isAccept ? 'text-green-700' : 'text-red-700'}>
                            {step === 1 ? 'Review Booking Request' : 'Final Confirmation'}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {step === 1 ? (
                            <>
                                Please review the guest's profile and booking details carefully before {isAccept ? 'accepting' : 'rejecting'} this request.
                            </>
                        ) : (
                            <span className="font-semibold text-orange-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                This action cannot be undone. Please confirm your decision.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-6 py-4">
                        {/* Guest Profile Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-[#0B3D6F] mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Guest Profile
                            </h3>

                            <div className="flex items-start gap-4 mb-4">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                    <AvatarImage src={guest?.avatar_url} />
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                        {guest?.full_name?.[0] || 'G'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-2">
                                    <h4 className="text-xl font-bold text-gray-900">
                                        {guest?.full_name || 'Guest User'}
                                    </h4>

                                    <div className="space-y-1.5">
                                        {guest?.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                <span>{guest.email}</span>
                                            </div>
                                        )}

                                        {guest?.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                <span>{guest.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Member since: {new Date(guest?.created_at || Date.now()).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Booking Details Section */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                            <h3 className="text-lg font-bold text-[#0B3D6F] mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Booking Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property</p>
                                    <p className="font-bold text-gray-900">{booking?.property?.title}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Room</p>
                                    <p className="font-bold text-gray-900">{booking?.room?.name}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-in</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(booking?.start_date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-out</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(booking?.end_date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {booking?.trip_purpose && (
                                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 md:col-span-2">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trip Purpose</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-[#F17720]/10 text-[#F17720] hover:bg-[#F17720]/20 font-bold">
                                                {booking.trip_purpose}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {booking.trip_purpose === 'Family' && '👨‍👩‍👧‍👦 Family vacation'}
                                                {booking.trip_purpose === 'Friends' && '🎉 Friends getaway'}
                                                {booking.trip_purpose === 'Company' && '💼 Business/Work trip'}
                                                {booking.trip_purpose === 'Other' && '✈️ Other purpose'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 bg-gradient-to-r from-[#0B3D6F] to-[#062a4d] rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Price</span>
                                    <span className="text-2xl font-extrabold">{booking?.total_price} TND</span>
                                </div>
                                <p className="text-xs text-blue-200 mt-1">
                                    {Math.ceil((new Date(booking?.end_date).getTime() - new Date(booking?.start_date).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                                </p>
                            </div>
                        </div>

                        {/* Warning/Info Box */}
                        <div className={`rounded-lg p-4 border-2 ${isAccept
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className={`w-5 h-5 mt-0.5 ${isAccept ? 'text-green-600' : 'text-red-600'
                                    }`} />
                                <div className="flex-1">
                                    <h4 className={`font-bold mb-1 ${isAccept ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                        {isAccept ? 'Before Accepting' : 'Before Rejecting'}
                                    </h4>
                                    <p className={`text-sm ${isAccept ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {isAccept
                                            ? 'By accepting this booking, you commit to hosting this guest for the specified dates. Make sure the property will be available and ready.'
                                            : 'Rejecting this booking will notify the guest immediately. This action cannot be undone and may affect your property\'s reputation.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8">
                        <div className={`rounded-xl p-8 text-center border-2 ${isAccept
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}>
                            {isAccept ? (
                                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            ) : (
                                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                            )}

                            <h3 className={`text-2xl font-bold mb-3 ${isAccept ? 'text-green-900' : 'text-red-900'
                                }`}>
                                Are you absolutely sure?
                            </h3>

                            <p className={`text-lg mb-2 ${isAccept ? 'text-green-700' : 'text-red-700'
                                }`}>
                                You are about to <span className="font-bold">{isAccept ? 'ACCEPT' : 'REJECT'}</span> the booking request from:
                            </p>

                            <div className="bg-white rounded-lg p-4 my-4 inline-block">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-gray-200">
                                        <AvatarImage src={guest?.avatar_url} />
                                        <AvatarFallback>{guest?.full_name?.[0] || 'G'}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">{guest?.full_name || 'Guest User'}</p>
                                        <p className="text-sm text-gray-600">{guest?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <p className={`text-sm font-medium ${isAccept ? 'text-green-600' : 'text-red-600'
                                }`}>
                                For the dates: {new Date(booking?.start_date).toLocaleDateString()} - {new Date(booking?.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>

                    {step === 1 ? (
                        <Button
                            onClick={handleFirstConfirm}
                            className={isAccept
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }
                        >
                            Continue to Confirmation
                        </Button>
                    ) : (
                        <Button
                            onClick={handleFinalConfirm}
                            disabled={isLoading}
                            className={isAccept
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }
                        >
                            {isLoading ? 'Processing...' : `Yes, ${isAccept ? 'Accept' : 'Reject'} Booking`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
