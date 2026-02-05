'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, differenceInDays, addDays, isWithinInterval, parseISO } from 'date-fns'
import { CalendarIcon, Users, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/auth-modal'
import { useLanguage } from '@/components/providers/language-provider'

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
}

export function BookingSection({ propertyId, rooms }: BookingSectionProps) {
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLanguage()

    // Default to first room
    const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '')
    const [date, setDate] = useState<{ from: Date; to?: Date } | undefined>()
    const [tripPurpose, setTripPurpose] = useState<string>('')
    const [guests, setGuests] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [disabledDates, setDisabledDates] = useState<Date[]>([])
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    const selectedRoom = rooms.find(r => r.id === selectedRoomId)
    const pricePerNight = selectedRoom?.price_per_night || 0
    const maxGuests = selectedRoom?.max_guests || 1

    // Fetch availability when room changes
    useEffect(() => {
        if (!selectedRoomId) return

        const fetchBlockedDates = async () => {
            // Direct query instead of RPC to avoid SQL setup issues
            const { data, error } = await supabase
                .from('bookings')
                .select('start_date, end_date')
                .eq('room_id', selectedRoomId)
                .neq('status', 'cancelled')
                .gte('end_date', new Date().toISOString())

            if (data) {
                const blocked: Date[] = []
                data.forEach((booking: any) => {
                    let curr = parseISO(booking.start_date)
                    const end = parseISO(booking.end_date)

                    // Add all days in range
                    while (curr < end) {
                        blocked.push(new Date(curr))
                        curr = addDays(curr, 1)
                    }
                })
                setDisabledDates(blocked)
            }
        }

        fetchBlockedDates()
    }, [selectedRoomId, supabase])

    const numberOfNights = date?.from && date?.to
        ? differenceInDays(date.to, date.from)
        : 0

    const totalPrice = numberOfNights * pricePerNight
    const serviceFee = totalPrice * 0.1 // 10% fee

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

        // 2. Double Check Availability (Client-Direct Check)
        // We check if existing overlapping bookings < units_count
        const { count, error: countError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true }) // head:true means we typically just want count, but with filters
            .eq('room_id', selectedRoomId)
            .neq('status', 'cancelled')
            .lt('start_date', endStr)
            .gt('end_date', startStr)

        if (countError) {
            console.error(countError)
            toast.error(t.booking.systemError)
            setIsLoading(false)
            return
        }

        const unitsAvailable = selectedRoom?.units_count || 1
        // If overlapping bookings >= total units, then it's full
        if ((count || 0) >= unitsAvailable) {
            toast.error(t.booking.notAvailable)
            setIsLoading(false)
            return
        }

        try {
            toast.loading(t.booking.processing)
            // 3. Create Booking Request
            const { error } = await supabase
                .from('bookings')
                .insert({
                    property_id: propertyId,
                    room_id: selectedRoomId,
                    user_id: user.id,
                    start_date: startStr,
                    end_date: endStr,
                    total_price: totalPrice + serviceFee,
                    trip_purpose: tripPurpose, // Save the trip purpose
                    status: 'pending' // Pending approval
                })

            if (error) throw error

            toast.dismiss()
            toast.success(t.booking.requestSent)
            setDate(undefined)
            router.push('/bookings')

        } catch (error: any) {
            console.error(error)
            toast.dismiss()
            toast.error(t.booking.failed + error.message)
        } finally {
            setIsLoading(false)
            console.log("Booking process finished")
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
        <Card className="shadow-2xl border-0 overflow-hidden ring-1 ring-black/5 rounded-3xl backdrop-blur-sm bg-white/80">
            {/* Price Header */}
            <div className="bg-[#0B3D6F] p-6 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-50" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight">{pricePerNight} TND</span>
                        <span className="text-blue-100 font-medium">/ {t.booking.night}</span>
                    </div>
                    {/* Units Warning if low */}
                    {selectedRoom && selectedRoom.units_count < 3 && (
                        <span className="text-xs bg-orange-500/20 text-orange-200 px-2 py-0.5 rounded-full mt-2 border border-orange-500/30">
                            {t.booking.onlyLeft.replace('{count}', selectedRoom.units_count.toString())}
                        </span>
                    )}
                </div>
            </div>

            <CardContent className="p-6 space-y-6">
                {/* Room Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        {t.booking.accommodation}
                    </label>
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                        <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 focus:ring-[#0B3D6F]">
                            <SelectValue placeholder={t.booking.selectRoomPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {rooms.map(room => (
                                <SelectItem key={room.id} value={room.id}>
                                    <div className="flex flex-col text-left py-1">
                                        <span className="font-bold text-gray-900">{room.name}</span>
                                        <span className="text-xs text-muted-foreground">{room.max_guests} {t.booking.guests} • {room.beds} {t.booking.beds}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t.booking.dates}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-12 bg-gray-50 border-gray-200 hover:bg-gray-100",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#F17720]" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                                        </>
                                    ) : (
                                        format(date.from, "MMM dd")
                                    )
                                ) : (
                                    <span>{t.booking.checkIn} - {t.booking.checkOut}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                                disabled={[
                                    { before: new Date() }, // Past dates
                                    ...disabledDates // Booked dates
                                ]}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Trip Purpose */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t.booking.tripType}</label>
                    <Select value={tripPurpose} onValueChange={setTripPurpose}>
                        <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 focus:ring-[#0B3D6F]">
                            <SelectValue placeholder={t.booking.purpose} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Family">👨‍👩‍👧‍👦 {t.booking.familyTrip}</SelectItem>
                            <SelectItem value="Friends">🎉 {t.booking.friendsGetaway}</SelectItem>
                            <SelectItem value="Company">💼 {t.booking.businessWork}</SelectItem>
                            <SelectItem value="Other">✈️ {t.booking.other}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Guest Count */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t.booking.guests}</label>
                    <div className="flex items-center border border-gray-200 bg-gray-50 rounded-md h-12 px-3 focus-within:ring-2 focus-within:ring-[#0B3D6F] focus-within:ring-offset-1 transition-all">
                        <Users className="w-4 h-4 mr-2 text-[#F17720]" />
                        <input
                            type="number"
                            min="1"
                            max={maxGuests}
                            value={guests}
                            onChange={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val)) setGuests(val)
                                else setGuests(1) // Fallback to 1 if empty/invalid to prevent NaN
                            }}
                            className="w-full outline-none bg-transparent font-medium text-gray-900"
                        />
                    </div>
                </div>

                {/* Price Breakdown */}
                {date?.from && date?.to && numberOfNights > 0 && (
                    <div className="bg-blue-50/50 rounded-xl p-4 space-y-3 text-sm border border-blue-100 animate-in slide-in-from-top-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">{pricePerNight} TND x {numberOfNights} {t.booking.nights}</span>
                            <span className="font-medium text-gray-900">{totalPrice} TND</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 flex items-center gap-1">
                                {t.booking.serviceFee}
                                <AlertCircle className="w-3 h-3 text-gray-400 cursor-help" />
                            </span>
                            <span className="font-medium text-gray-900">{serviceFee.toFixed(2)} TND</span>
                        </div>
                        <div className="h-px bg-blue-200/50 my-2" />
                        <div className="flex justify-between text-base font-bold text-[#0B3D6F]">
                            <span>{t.booking.total}</span>
                            <span>{(totalPrice + serviceFee).toFixed(2)} TND</span>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full h-12 text-lg font-bold bg-[#F17720] hover:bg-[#d1661b] text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                    onClick={handleReserve}
                    disabled={isLoading || !date?.from || !date?.to}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">{t.booking.processing}</span>
                    ) : (
                        t.booking.requestToBook
                    )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    {t.booking.noCharge}
                </p>
            </CardContent>

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
                onSuccess={() => {
                    toast.success("Logged in successfully! You can now request to book.")
                    // relying on user to click book again, preserving their form state
                }}
            />
        </Card>
    )
}
