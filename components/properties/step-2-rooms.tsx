'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, BedDouble, Users, DollarSign } from 'lucide-react'
import { PropertyFormData } from '@/components/properties/types'
import { Card, CardContent } from '@/components/ui/card'

interface Step2Props {
    data: PropertyFormData
    updateData: (data: Partial<PropertyFormData>) => void
    onBack: () => void
    onNext: (data?: Partial<PropertyFormData>) => void
    mode?: 'create' | 'edit'
    isSaving?: boolean
}

type Room = PropertyFormData['rooms'][0]

export function Step2Rooms({ data, updateData, onBack, onNext, mode = 'create', isSaving = false }: Step2Props) {
    const isSingleHouse = data.type === 'House'
    const unitLabel = isSingleHouse ? 'Room' : 'House'
    const pluralLabel = isSingleHouse ? 'Rooms' : 'Houses'

    const [rooms, setRooms] = useState<Room[]>(data.rooms.length > 0 ? data.rooms : [{
        name: isSingleHouse ? 'Master Bedroom' : 'Unit 1',
        price_per_night: 0,
        beds: 1,
        max_guests: 2,
        units_count: 1,
        room_count: 1
    }])

    const addRoom = () => {
        setRooms([...rooms, {
            name: `${unitLabel} ${rooms.length + 1}`,
            price_per_night: 0,
            beds: 1,
            max_guests: 2,
            units_count: 1,
            room_count: 1
        }])
    }

    const removeRoom = (index: number) => {
        if (rooms.length > 1) {
            const newRooms = rooms.filter((_, i) => i !== index)
            setRooms(newRooms)
        }
    }

    const updateRoom = (index: number, field: keyof Room, value: string | number) => {
        const newRooms = [...rooms]
        newRooms[index] = { ...newRooms[index], [field]: value }
        setRooms(newRooms)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Validate
        if (rooms.some(r => r.price_per_night <= 0)) {
            alert("Price must be greater than 0")
            return
        }
        const latestData = { rooms }
        updateData(latestData)
        onNext(latestData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div>
                <h2 className="text-2xl font-black text-[#0B3D6F] tracking-tight">{pluralLabel} & Rates</h2>
                <p className="text-sm text-slate-500 font-medium tracking-wide">Add {pluralLabel.toLowerCase()} available in your property.</p>
            </div>

            <div className="space-y-4">
                {rooms.map((room, index) => (
                    <Card key={index} className="relative overflow-hidden border-none shadow-xl ring-1 ring-black/5 bg-white rounded-3xl">
                        {/* Orange highlight bar */}
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#F17720]" />

                        <CardContent className="pt-8 pb-8 px-8">
                            {rooms.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10 transition-colors"
                                    onClick={() => removeRoom(index)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            )}

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-[#0B3D6F] opacity-70 ml-1">{unitLabel} Name</Label>
                                    <Input
                                        value={room.name}
                                        onChange={(e) => updateRoom(index, 'name', e.target.value)}
                                        placeholder={isSingleHouse ? "e.g. Master Bedroom" : "e.g. Villa A1"}
                                        className="h-12 border-slate-200 focus:border-[#F17720] focus:ring-[#F17720]/20 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#0B3D6F] opacity-70 ml-1">
                                        <DollarSign className="w-4 h-4 text-[#F17720]" />
                                        Price per Night (TND)
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={room.price_per_night}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value)
                                            updateRoom(index, 'price_per_night', isNaN(val) ? 0 : val)
                                        }}
                                        className="h-12 border-slate-200 focus:border-[#F17720] focus:ring-[#F17720]/20 rounded-xl font-bold text-lg"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 col-span-2 gap-6 pt-2">
                                    {/* Number of Rooms (Bedroom count) */}
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#0B3D6F] opacity-60 ml-0.5">
                                            Number of Rooms
                                        </Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'room_count', Math.max(1, (room.room_count || 1) - 1))}
                                            >-</Button>
                                            <span className="flex-1 text-center font-black text-[#0B3D6F]">{room.room_count || 1}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'room_count', (room.room_count || 1) + 1)}
                                            >+</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#0B3D6F] opacity-60 ml-0.5">
                                            <BedDouble className="w-4 h-4 text-[#F17720]" /> Total Beds
                                        </Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'beds', Math.max(1, room.beds - 1))}
                                            >-</Button>
                                            <span className="flex-1 text-center font-black text-[#0B3D6F]">{room.beds}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'beds', room.beds + 1)}
                                            >+</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#0B3D6F] opacity-60 ml-0.5">
                                            <Users className="w-4 h-4 text-[#F17720]" /> Max Guests
                                        </Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'max_guests', Math.max(1, room.max_guests - 1))}
                                            >-</Button>
                                            <span className="flex-1 text-center font-black text-[#0B3D6F]">{room.max_guests}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'max_guests', room.max_guests + 1)}
                                            >+</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#0B3D6F] opacity-60 ml-0.5">
                                            {unitLabel}s Available
                                        </Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'units_count', Math.max(1, (room.units_count || 1) - 1))}
                                            >-</Button>
                                            <span className="flex-1 text-center font-black text-[#0B3D6F]">{room.units_count || 1}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm hover:text-[#F17720]"
                                                onClick={() => updateRoom(index, 'units_count', (room.units_count || 1) + 1)}
                                            >+</Button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium px-1 leading-tight">Total number of identical {unitLabel.toLowerCase()}s</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addRoom} className="w-full border-dashed border-2 py-8 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-[#0B3D6F] font-bold tracking-wide transition-all hover:scale-[1.01]">
                <Plus className="mr-3 h-5 w-5 text-[#F17720]" /> Add Another {unitLabel}
            </Button>

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
                    Back
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#0B3D6F] text-white hover:bg-[#092d52] px-8">
                    {isSaving ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Next Step')}
                </Button>
            </div>
        </form>
    )
}
