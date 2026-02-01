'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Calendar as CalendarIcon, Users, Minus, Plus } from 'lucide-react'
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

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (location) params.set('location', location)
        if (guests > 1) params.set('guests', guests.toString())
        if (date?.from) params.set('from', format(date.from, 'yyyy-MM-dd'))
        if (date?.to) params.set('to', format(date.to, 'yyyy-MM-dd'))

        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl md:rounded-full p-2 md:p-3 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 animate-in fade-in zoom-in-95 duration-500">

                {/* Location Input with Suggestions */}
                <Popover open={openLocation} onOpenChange={setOpenLocation}>
                    <PopoverTrigger asChild>
                        <div
                            className="relative flex-1 group px-6 py-3 rounded-2xl md:rounded-full transition-colors hover:bg-gray-50 cursor-pointer border md:border-transparent text-left"
                            onClick={() => setOpenLocation(true)}
                        >
                            <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-widest mb-1 group-hover:text-[#F17720] transition-colors cursor-pointer">
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
                                placeholder="Where are you going?"
                                className="w-full bg-transparent outline-none text-gray-700 font-semibold placeholder:text-gray-400 truncate cursor-pointer"
                                autoComplete="off"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
                                <MapPin className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px] sm:w-[350px]" align="start">
                        <div className="p-2">
                            {location.length > 0 && suggestions.length > 0 ? (
                                <>
                                    <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</h4>
                                    <div className="grid gap-1">
                                        {suggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setLocation(city)
                                                    setOpenLocation(false)
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
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
                                    <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Popular Destinations</h4>
                                    <div className="grid gap-1">
                                        {["Tunis", "Hammamet", "Sousse", "Djerba", "Kelibia", "Sidi Bou Said"].map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setLocation(city)
                                                    setOpenLocation(false)
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
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

                <div className="hidden md:block w-px h-10 bg-gray-200" />

                {/* Date Picker */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3 rounded-2xl md:rounded-full transition-colors hover:bg-gray-50 cursor-pointer border md:border-transparent text-left w-full">
                                <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-widest mb-1 group-hover:text-[#F17720] transition-colors">
                                    Check in / out
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-semibold truncate">
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                                            </>
                                        ) : (
                                            format(date.from, "MMM dd")
                                        )
                                    ) : (
                                        <span className="text-gray-400 font-medium">Add dates</span>
                                    )}
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="rounded-md border p-4 pointer-events-auto"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px h-10 bg-gray-200" />

                {/* Guests Picker */}
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative group px-6 py-3 rounded-2xl md:rounded-full transition-colors hover:bg-gray-50 cursor-pointer border md:border-transparent text-left w-full">
                                <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-widest mb-1 group-hover:text-[#F17720] transition-colors">
                                    Guests
                                </label>
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                    {guests > 0 ? (
                                        <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                                    ) : (
                                        <span className="text-gray-400 font-medium">Add guests</span>
                                    )}
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
                                    <Users className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-6" align="center">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-[#0B3D6F]">Guests</span>
                                    <span className="text-sm text-gray-500">How many people?</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-8 w-8 border-gray-300"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        disabled={guests <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-4 text-center font-bold text-lg">{guests}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-8 w-8 border-gray-300"
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
                <div className="p-2 md:p-0">
                    <Button
                        onClick={handleSearch}
                        className="w-full md:w-auto rounded-xl md:rounded-full h-14 md:h-14 px-8 bg-[#0B3D6F] hover:bg-[#092d52] text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg font-bold"
                    >
                        <Search className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="md:hidden">Search</span>
                        <span className="hidden md:inline">Search</span>
                    </Button>
                </div>

            </div>
        </div>
    )
}
