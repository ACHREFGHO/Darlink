'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, differenceInDays, addDays, isWithinInterval, parseISO } from 'date-fns'
import { CalendarIcon, Users, ChevronDown, CheckCircle2, AlertCircle, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/auth-modal'
import { useLanguage } from '@/components/providers/language-provider'
import { useCurrency } from '@/components/providers/currency-provider'

interface Room {
    id: string
    name: string
    price_per_night: number
    max_guests: number
    beds: number
    units_count: number
}

interface BookingSectionProps {
    propertyId: string
    rooms: Room[]
    propertyType?: 'House' | 'Apartment' | 'Guesthouse'
    // Lifted State
    selectedRoomId: string
    setSelectedRoomId: (id: string) => void
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    disabledDates: Date[]
}

export function BookingSection({
    propertyId,
    rooms,
    propertyType,
    selectedRoomId,
    setSelectedRoomId,
    date,
    setDate,
    disabledDates
}: BookingSectionProps) {
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLanguage()
    const { formatPrice } = useCurrency()

    const [tripPurpose, setTripPurpose] = useState<string>('')
    const [guests, setGuests] = useState(1)
    const [unitsToBook, setUnitsToBook] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    const selectedRoom = rooms.find(r => r.id === selectedRoomId)
    const pricePerNight = selectedRoom?.price_per_night || 0
    const maxGuests = selectedRoom?.max_guests || 1
    const unitsAvailable = selectedRoom?.units_count || 1

    const getPriceForDate = (day: Date) => {
        const dayOfWeek = day.getDay()
        // Friday (5) or Saturday (6) - Higher rates for weekends in Tunisia
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
        return isWeekend ? pricePerNight * 1.25 : pricePerNight
    }

    const calculateDynamics = () => {
        if (!date?.from || !date?.to) return { total: 0, nights: 0, hasWeekend: false }

        let total = 0
        let curr = new Date(date.from)
        let nights = 0
        let hasWeekend = false

        while (curr < date.to) {
            const price = getPriceForDate(curr)
            if (price > pricePerNight) hasWeekend = true
            total += price
            nights++
            curr = addDays(curr, 1)
        }

        return { total: total * unitsToBook, nights, hasWeekend }
    }

    const { total: totalPrice, nights: numberOfNights, hasWeekend } = calculateDynamics()
    const serviceFee = totalPrice * 0.1

    const handleReserve = async () => {
        if (!selectedRoomId) return toast.error(t.booking.selectRoom)
        if (!date?.from || !date?.to) return toast.error(t.booking.selectDates)
        if (!tripPurpose) return toast.error(t.booking.selectPurpose)

        setIsLoading(true)

        // 1. Check Auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setIsAuthModalOpen(true)
            setIsLoading(false)
            return
        }

        const startStr = format(date.from, 'yyyy-MM-dd')
        const endStr = format(date.to, 'yyyy-MM-dd')

        // 2. Double Check Availability (Accounting for units_booked)
        const { data: activeBookings, error: checkError } = await supabase
            .from('bookings')
            .select('units_booked, start_date, end_date')
            .eq('room_id', selectedRoomId)
            .neq('status', 'cancelled')
            .lt('start_date', endStr)
            .gt('end_date', startStr)

        if (checkError) {
            toast.error(t.booking.systemError)
            setIsLoading(false)
            return
        }

        // Calculate max simultaneous bookings in this range
        const overlappingUnits = activeBookings?.reduce((acc, b) => acc + (b.units_booked || 1), 0) || 0

        if (overlappingUnits + unitsToBook > unitsAvailable) {
            toast.error(t.booking.notAvailable)
            setIsLoading(false)
            return
        }

        try {
            const loadingToast = toast.loading(t.booking.processing)

            const { error: insertError } = await supabase
                .from('bookings')
                .insert({
                    property_id: propertyId,
                    room_id: selectedRoomId,
                    user_id: user.id,
                    start_date: startStr,
                    end_date: endStr,
                    total_price: totalPrice + serviceFee,
                    trip_purpose: tripPurpose,
                    status: 'pending',
                    units_booked: unitsToBook
                })

            toast.dismiss(loadingToast)

            if (insertError) {
                console.error("Booking submission error:", insertError)
                throw new Error(insertError.message)
            }

            toast.success(t.booking.requestSent)

            // Wait a tiny bit for the toast to be seen before redirect
            setTimeout(() => {
                setDate(undefined)
                router.push('/bookings')
                router.refresh()
                // Safety: reset loading state after redirect starts
                setIsLoading(false)
            }, 1000)

        } catch (error: any) {
            console.error("Critical booking failure:", error)
            toast.error(t.booking.failed + (error.message || "Unknown error"))
            setIsLoading(false)
        }
    }

    if (rooms.length === 0) {
        return (
            <Card className="shadow-lg border-2 border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    {t.booking.noRoomsAvailable}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-0 overflow-hidden rounded-[2.5rem] bg-white/90 backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-[100px] opacity-20 -z-1" />

            {/* Price Header */}
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D6F] to-[#062a4d] opacity-100 transition-transform group-hover:scale-110 duration-700" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                        <span className="text-4xl font-black tracking-tight">{formatPrice(pricePerNight)}</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-200/80">/ {t.booking.night}</span>
                        </div>
                    </div>
                    {/* Units Warning if low */}
                    {selectedRoom && selectedRoom.units_count < 3 && (
                        <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">
                                {t.booking.onlyLeft.replace('{count}', selectedRoom.units_count.toString())}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <CardContent className="p-8 space-y-8">
                {/* Room/Unit Selector */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                        {propertyType === 'Apartment' ? 'Apartment Type / Selection' : propertyType === 'Guesthouse' ? 'Select Room' : t.booking.accommodation}
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </label>
                    <Select value={selectedRoomId} onValueChange={(val) => {
                        setSelectedRoomId(val)
                        setUnitsToBook(1) // Reset quantity on change
                    }}>
                        <SelectTrigger className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#0B3D6F] font-bold text-slate-700 hover:bg-slate-100/50 transition-all px-6">
                            <SelectValue placeholder={t.booking.selectRoomPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            {rooms.map(room => (
                                <SelectItem key={room.id} value={room.id} className="rounded-xl py-3 focus:bg-slate-50">
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#0B3D6F]">{room.name}</span>
                                            {room.units_count > 1 && (
                                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-slate-200 text-slate-400 font-bold uppercase">Multi-Unit</Badge>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{room.max_guests} {t.booking.guests} • {room.beds} {t.booking.beds}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Units Quantity Selector - Only if multiple units are available for this choice */}
                {selectedRoom && selectedRoom.units_count > 1 && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                            Number of {propertyType === 'Apartment' ? 'Apartments' : 'Units'}
                            <span className="text-[9px] text-[#F17720] lowercase font-bold">{selectedRoom.units_count} available</span>
                        </label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 focus-within:ring-2 focus-within:ring-[#0B3D6F]/20 transition-all">
                            <Hash className="w-5 h-5 mr-3 text-[#F17720]" />
                            <input
                                type="number"
                                min="1"
                                max={selectedRoom.units_count}
                                value={unitsToBook}
                                onChange={(e) => setUnitsToBook(Math.min(selectedRoom.units_count, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full outline-none bg-transparent font-black text-slate-700 text-lg"
                            />
                        </div>
                    </div>
                )}

                {/* Date Picker */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.booking.dates}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left h-14 bg-slate-50 border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-all px-6",
                                    !date && "text-slate-400 font-medium",
                                    date && "font-black text-slate-700"
                                )}
                            >
                                <CalendarIcon className="mr-3 h-5 w-5 text-[#F17720]" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                                        </>
                                    ) : (
                                        format(date.from, "MMM dd")
                                    )
                                ) : (
                                    <span className="uppercase tracking-[0.05em] text-xs font-black">{t.booking.checkIn} - {t.booking.checkOut}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 rounded-3xl border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(range) => {
                                    if (range?.from) {
                                        setDate({ from: range.from, to: range.to })
                                    } else {
                                        setDate(undefined)
                                    }
                                }}
                                numberOfMonths={2}
                                className="font-bold"
                                disabled={[
                                    { before: new Date() },
                                    ...disabledDates
                                ]}
                            />
                        </PopoverContent>
                    </Popover>
                    {date?.from && date?.to && (
                        <div className="flex items-center gap-2 px-1 animate-in slide-in-from-left-2 duration-300">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Dates available</span>
                        </div>
                    )}
                </div>

                {/* Grid for Purpose and Guests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.booking.tripType}</label>
                        <Select value={tripPurpose} onValueChange={setTripPurpose}>
                            <SelectTrigger className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#0B3D6F] font-bold text-slate-700">
                                <SelectValue placeholder={t.booking.purpose} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                <SelectItem value="Family" className="py-3 font-bold">Family</SelectItem>
                                <SelectItem value="Friends" className="py-3 font-bold">Friends</SelectItem>
                                <SelectItem value="Company" className="py-3 font-bold">Business</SelectItem>
                                <SelectItem value="Other" className="py-3 font-bold">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.booking.guests}</label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 focus-within:ring-2 focus-within:ring-[#0B3D6F]/20 transition-all">
                            <Users className="w-5 h-5 mr-3 text-[#F17720]" />
                            <input
                                type="number"
                                min="1"
                                max={maxGuests}
                                value={guests}
                                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                className="w-full outline-none bg-transparent font-black text-slate-700 text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Price Breakdown */}
                {date?.from && date?.to && numberOfNights > 0 && (
                    <div className="bg-[#0B3D6F]/[0.02] rounded-3xl p-6 space-y-4 border border-slate-100/50 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                Base Fare ({numberOfNights} nights {unitsToBook > 1 && `× ${unitsToBook} units`})
                            </span>
                            <span className="font-bold text-slate-900 leading-none">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                        {hasWeekend && (
                            <div className="flex justify-between items-center text-[10px] text-[#F17720] font-black uppercase tracking-widest">
                                <span>Weekend Premium (+25%)</span>
                                <div className="h-px flex-1 mx-3 bg-orange-100" />
                                <span>Applied</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                                Marketplace Fee
                                <Popover>
                                    <PopoverTrigger><AlertCircle className="w-3 h-3 text-slate-300 hover:text-slate-600 cursor-help" /></PopoverTrigger>
                                    <PopoverContent className="text-xs font-bold text-slate-500 rounded-xl leading-relaxed">
                                        This small fee helps us run the platform and provide 24/7 support for your stay.
                                    </PopoverContent>
                                </Popover>
                            </span>
                            <span className="font-bold text-slate-900 leading-none">
                                {formatPrice(serviceFee)}
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t.booking.total}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ALL TAXES INCLUDED</span>
                            </div>
                            <span className="text-3xl font-black text-[#0B3D6F] tracking-tighter leading-none">
                                {formatPrice(totalPrice + serviceFee)}
                            </span>
                        </div>
                    </div>
                )}

                <div className="space-y-4 pt-2">
                    <Button
                        className="w-full h-16 text-lg font-black bg-[#F17720] hover:bg-[#d1661b] text-white shadow-[0_15px_30px_-5px_rgba(241,119,32,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-[1.25rem] uppercase tracking-widest group"
                        onClick={handleReserve}
                        disabled={isLoading || !date?.from || !date?.to}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                {t.booking.processing}
                            </div>
                        ) : (
                            <span className="flex items-center gap-2">
                                {t.booking.requestToBook}
                            </span>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                        <div className="h-px flex-1 bg-slate-100" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            No immediate charge
                        </p>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                </div>
            </CardContent>

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
                onSuccess={() => {
                    toast.success("Logged in successfully! You can now request to book.")
                }}
            />
        </Card>
    )
}
