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
    const [rooms, setRooms] = useState<Room[]>(data.rooms.length > 0 ? data.rooms : [{
        name: 'Master Bedroom',
        price_per_night: 0,
        beds: 1,
        max_guests: 2,
        units_count: 1
    }])

    const addRoom = () => {
        setRooms([...rooms, {
            name: `Room ${rooms.length + 1}`,
            price_per_night: 0,
            beds: 1,
            max_guests: 2,
            units_count: 1
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#0B3D6F]">Rooms & Rates</h2>
                <p className="text-sm text-muted-foreground">Add rooms available in your property.</p>
            </div>

            <div className="space-y-4">
                {rooms.map((room, index) => (
                    <Card key={index} className="relative overflow-hidden border-l-4 border-l-[#F17720]">
                        <CardContent className="pt-6">
                            {rooms.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeRoom(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label>Room Name</Label>
                                    <Input
                                        value={room.name}
                                        onChange={(e) => updateRoom(index, 'name', e.target.value)}
                                        placeholder="e.g. Sea View Suite"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Price per Night (TND)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={room.price_per_night}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value)
                                            updateRoom(index, 'price_per_night', isNaN(val) ? 0 : val)
                                        }}
                                        required
                                    />
                                </div>

                                <div className="space-y-2 col-span-1">
                                    <Label className="flex items-center gap-2"><BedDouble className="w-4 h-4" /> Beds</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'beds', Math.max(1, room.beds - 1))}
                                        >-</Button>
                                        <span className="w-8 text-center">{room.beds}</span>
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'beds', room.beds + 1)}
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-1">
                                    <Label className="flex items-center gap-2"><Users className="w-4 h-4" /> Max Guests</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'max_guests', Math.max(1, room.max_guests - 1))}
                                        >-</Button>
                                        <span className="w-8 text-center">{room.max_guests}</span>
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'max_guests', room.max_guests + 1)}
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-1">
                                    <Label className="flex items-center gap-2">Units Available</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'units_count', Math.max(1, (room.units_count || 1) - 1))}
                                        >-</Button>
                                        <span className="w-8 text-center">{room.units_count || 1}</span>
                                        <Button
                                            type="button" variant="outline" size="icon" className="h-8 w-8"
                                            onClick={() => updateRoom(index, 'units_count', (room.units_count || 1) + 1)}
                                        >+</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground w-full">How many of this room type do you have?</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addRoom} className="w-full border-dashed border-2 py-6">
                <Plus className="mr-2 h-4 w-4" /> Add Another Room
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
