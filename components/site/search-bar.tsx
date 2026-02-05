'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Calendar as CalendarIcon, Users, Minus, Plus, Check, Heart, PartyPopper, Briefcase, Home } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

export function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [location, setLocation] = useState(searchParams.get('location') || '')
    const [openLocation, setOpenLocation] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [date, setDate] = useState<DateRange | undefined>()
    const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'))
    const [propertyType, setPropertyType] = useState(searchParams.get('type') || '')
    const [tripType, setTripType] = useState(searchParams.get('category') || '')

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (location) params.set('location', location)
        if (guests > 1) params.set('guests', guests.toString())
        if (date?.from) params.set('from', format(date.from, 'yyyy-MM-dd'))
        if (date?.to) params.set('to', format(date.to, 'yyyy-MM-dd'))
        if (propertyType) params.set('type', propertyType)
        if (tripType) params.set('category', tripType)

        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row p-2 animate-in fade-in zoom-in-95 duration-500 border border-gray-100">

                {/* Location Input */}
                <Popover open={openLocation} onOpenChange={setOpenLocation}>
                    <PopoverTrigger asChild>
                        <div
                            className="relative flex-[1.5] group px-6 py-3.5 rounded-[2rem] transition-all hover:bg-gray-100 cursor-pointer text-left"
                            onClick={() => setOpenLocation(true)}
                        >
                            <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 group-hover:text-gray-900 transition-colors cursor-pointer">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setLocation(val)
                                    setOpenLocation(true)
                                    if (val.length > 2) {
                                        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=tn&limit=5`)
                                            .then(res => res.json())
                                            .then(data => {
                                                if (Array.isArray(data)) {
                                                    setSuggestions(data.map((item: any) => item.display_name.split(',')[0]))
                                                }
                                            })
                                            .catch(() => { })
                                    } else {
                                        setSuggestions([])
                                    }
                                }}
                                placeholder="Where to?"
                                className="w-full bg-transparent outline-none text-gray-700 font-bold text-sm placeholder:text-gray-400 truncate cursor-pointer"
                                autoComplete="off"
                            />
                            {/* Mobile Icon */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
                                <MapPin className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px] sm:w-[350px] shadow-xl rounded-2xl border-0" align="start">
                        <div className="p-2">
                            {location.length > 0 && suggestions.length > 0 ? (
                                <>
                                    <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</h4>
                                    <div className="grid gap-1">
                                        {suggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setLocation(city)
                                                    setOpenLocation(false)
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="bg-gray-100 p-2 rounded-full">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                </div>
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Popular</h4>
                                    <div className="grid gap-1">
                                        {["Tunis", "Hammamet", "Sousse", "Djerba", "Kelibia", "Sidi Bou Said"].map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setLocation(city)
                                                    setOpenLocation(false)
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="bg-gray-100 p-2 rounded-full">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                </div>
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="hidden md:block w-px h-8 bg-gray-200 my-auto" />

                {/* Dates */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3.5 rounded-[2rem] transition-all hover:bg-gray-100 cursor-pointer text-left w-full h-full flex flex-col justify-center">
                                <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 group-hover:text-gray-900 transition-colors">
                                    Dates
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm truncate">
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                                            </>
                                        ) : (
                                            format(date.from, "MMM dd")
                                        )
                                    ) : (
                                        <span className="text-gray-400 font-normal">Add dates</span>
                                    )}
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 shadow-xl rounded-2xl border-0" align="center">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="rounded-2xl border p-4 pointer-events-auto"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px h-8 bg-gray-200 my-auto" />

                {/* Property Type */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3.5 rounded-[2rem] transition-all hover:bg-gray-100 cursor-pointer text-left w-full h-full flex flex-col justify-center">
                                <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 group-hover:text-gray-900 transition-colors">
                                    Type
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm truncate">
                                    {propertyType ? propertyType : <span className="text-gray-400 font-normal">Any Type</span>}
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2 shadow-xl rounded-2xl border-0" align="center">
                            <div className="grid gap-1">
                                {['House', 'Apartment', 'Guesthouse'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setPropertyType(type === propertyType ? '' : type)}
                                        className={cn(
                                            "flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-colors text-left",
                                            propertyType === type ? "bg-[#F17720]/10 text-[#F17720]" : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        {/* You can add icons here if desired */}
                                        {type}
                                        {propertyType === type && <Check className="ml-auto w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px h-8 bg-gray-200 my-auto" />

                {/* Trip Type */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3.5 rounded-[2rem] transition-all hover:bg-gray-100 cursor-pointer text-left w-full h-full flex flex-col justify-center">
                                <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 group-hover:text-gray-900 transition-colors">
                                    Trip
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm truncate">
                                    {tripType ? tripType : <span className="text-gray-400 font-normal">Any Trip</span>}
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2 shadow-xl rounded-2xl border-0" align="center">
                            <div className="grid gap-1">
                                {[
                                    { id: 'Family', icon: Users, emoji: '👨‍👩‍👧‍👦' },
                                    { id: 'Friends', icon: PartyPopper, emoji: '🎉' },
                                    { id: 'Company', icon: Briefcase, emoji: '💼' }
                                ].map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setTripType(type.id === tripType ? '' : type.id)}
                                            className={cn(
                                                "flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-colors text-left",
                                                tripType === type.id ? "bg-[#F17720]/10 text-[#F17720]" : "text-gray-700 hover:bg-gray-100"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {type.id}
                                            {tripType === type.id && <Check className="ml-auto w-4 h-4" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px h-8 bg-gray-200 my-auto" />

                {/* Guests */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3.5 rounded-[2rem] transition-all hover:bg-gray-100 cursor-pointer text-left w-full h-full flex flex-col justify-center">
                                <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 group-hover:text-gray-900 transition-colors">
                                    Guests
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                    {guests > 0 ? (
                                        <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                                    ) : (
                                        <span className="text-gray-400 font-normal">Add guests</span>
                                    )}
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-6 shadow-xl rounded-2xl border-0" align="center">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-[#0B3D6F]">Guests</span>
                                    <span className="text-sm text-gray-500">How many people?</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-8 w-8 border-gray-300 hover:border-[#F17720] hover:text-[#F17720]"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        disabled={guests <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-4 text-center font-bold text-lg">{guests}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-8 w-8 border-gray-300 hover:border-[#F17720] hover:text-[#F17720]"
                                        onClick={() => setGuests(guests + 1)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Search Button */}
                <div className="p-1.5 md:p-0 flex items-center">
                    <Button
                        onClick={handleSearch}
                        className="w-full md:w-14 rounded-full h-12 md:h-14 px-0 bg-[#0B3D6F] hover:bg-[#F17720] text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                        <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" />
                    </Button>
                </div>

            </div>
        </div>
    )
}
