'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Search,
    MapPin,
    User,
    Filter,
    Eye,
    Building2,
    Calendar,
    ChevronRight,
    X,
    MessageSquare,
    Mail,
    Phone,
    ExternalLink,
    Wifi,
    Car,
    Tv,
    Utensils,
    Wind,
    Monitor,
    Coffee,
    Waves,
    CheckCircle2,
    History,
    AlertCircle
} from "lucide-react"
import { PropertyActions } from "./property-actions"
import { useDebounce } from "@/hooks/use-debounce"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const GOVERNORATES = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
    "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", "Manouba", "Medenine",
    "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
    "Tataouine", "Tozeur", "Tunis", "Zaghouan"
]

interface AdminPropertiesClientProps {
    initialProperties: any[]
    owners: any[]
}

export function AdminPropertiesClient({ initialProperties, owners }: AdminPropertiesClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('query') || '')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [ownerId, setOwnerId] = useState(searchParams.get('owner') || 'all')
    const [governorate, setGovernorate] = useState(searchParams.get('governorate') || 'all')

    const [selectedProperty, setSelectedProperty] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('query', debouncedQuery)
        if (status !== 'all') params.set('status', status)
        if (ownerId !== 'all') params.set('owner', ownerId)
        if (governorate !== 'all') params.set('governorate', governorate)

        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedQuery, status, ownerId, governorate, router])

    const handleViewDetails = (prop: any) => {
        setSelectedProperty(prop)
        setIsDetailsOpen(true)
    }

    const getAmenityIcon = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('wifi')) return <Wifi className="w-4 h-4" />
        if (lowerName.includes('parking')) return <Car className="w-4 h-4" />
        if (lowerName.includes('tv')) return <Tv className="w-4 h-4" />
        if (lowerName.includes('kitchen')) return <Utensils className="w-4 h-4" />
        if (lowerName.includes('ac') || lowerName.includes('air')) return <Wind className="w-4 h-4" />
        if (lowerName.includes('workspace')) return <Monitor className="w-4 h-4" />
        if (lowerName.includes('pool')) return <Waves className="w-4 h-4" />
        if (lowerName.includes('breakfast')) return <Coffee className="w-4 h-4" />
        return <CheckCircle2 className="w-4 h-4" />
    }

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Find property by title, city or reference..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-16 pl-14 pr-6 rounded-[1.25rem] border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-bold placeholder:text-slate-300 transition-all shadow-inner"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Advanced Filters</span>
                    </div>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-100 bg-white font-bold text-slate-600 shadow-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 border-2">
                            <SelectItem value="all" className="font-bold">All Status</SelectItem>
                            <SelectItem value="Pending" className="text-orange-500 font-bold">Pending Approval</SelectItem>
                            <SelectItem value="Published" className="text-green-600 font-bold">Published</SelectItem>
                            <SelectItem value="Rejected" className="text-red-500 font-bold">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={governorate} onValueChange={setGovernorate}>
                        <SelectTrigger className="h-12 w-[200px] rounded-xl border-slate-100 bg-white font-bold text-slate-600 shadow-sm">
                            <SelectValue placeholder="Governorate" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 border-2 h-72">
                            <SelectItem value="all" className="font-bold">All Regions (Tunisia)</SelectItem>
                            {GOVERNORATES.map(g => (
                                <SelectItem key={g} value={g} className="font-medium">{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={ownerId} onValueChange={setOwnerId}>
                        <SelectTrigger className="h-12 w-[240px] rounded-xl border-slate-100 bg-white font-bold text-slate-600 shadow-sm">
                            <SelectValue placeholder="Filter by Owner" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 border-2">
                            <SelectItem value="all" className="font-bold">All Registered Owners</SelectItem>
                            {owners.map(o => (
                                <SelectItem key={o.id} value={o.id} className="font-medium">{o.full_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(query || status !== 'all' || ownerId !== 'all' || governorate !== 'all') && (
                        <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-xl text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest"
                            onClick={() => {
                                setQuery('')
                                setStatus('all')
                                setOwnerId('all')
                                setGovernorate('all')
                            }}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="w-[400px] h-20 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-10">Listing Intelligence</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ownership</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Geographics</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scale</TableHead>
                            <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProperties.length > 0 ? (
                            initialProperties.map((prop) => (
                                <TableRow key={prop.id} className="group border-slate-50 hover:bg-slate-50/30 transition-all">
                                    <TableCell className="pl-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative h-20 w-24 rounded-[1.25rem] overflow-hidden bg-slate-100 flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all">
                                                {prop.images?.[0] ? (
                                                    <Image
                                                        src={prop.images[0]}
                                                        alt={prop.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <Building2 className="w-8 h-8 m-auto text-slate-300" />
                                                )}
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[8px] font-black text-[#0B3D6F] uppercase shadow-sm">
                                                    {prop.type}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <h3 className="font-black text-[#0B3D6F] text-xl leading-tight truncate group-hover:text-[#F17720] transition-colors">{prop.title}</h3>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(prop.created_at).toLocaleDateString()}
                                                    </div>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span>REF: {prop.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 border-2 border-white shadow-md ring-1 ring-slate-100">
                                                <AvatarImage src={prop.profiles?.avatar_url} />
                                                <AvatarFallback className="bg-slate-100 text-[#0B3D6F] font-black text-xs uppercase">
                                                    {prop.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 leading-none mb-1">{prop.profiles?.full_name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold tracking-tight">{prop.profiles?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 font-black text-[#0B3D6F]">
                                                <MapPin className="w-4 h-4 text-[#F17720]" />
                                                {prop.city}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] ml-6">{prop.governorate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Badge
                                                className={`w-fit rounded-full px-5 py-1.5 font-black text-[9px] uppercase tracking-widest border-0 shadow-sm
                                                    ${prop.status === 'Published' ? 'bg-green-100 text-green-600 ring-1 ring-green-600/10' : ''}
                                                    ${prop.status === 'Pending' ? 'bg-orange-100 text-orange-600 animate-pulse ring-1 ring-orange-600/10' : ''}
                                                    ${prop.status === 'Rejected' ? 'bg-red-100 text-red-500 ring-1 ring-red-500/10' : ''}
                                                `}
                                            >
                                                {prop.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-700 text-lg leading-none mb-1.5">{prop.type === 'House' ? 'Whole' : 'Multi'}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">
                                                    {prop.rooms?.[0]?.count || 0} Rooms
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-10 px-5 rounded-xl border-slate-100 text-[#0B3D6F] font-black uppercase text-[10px] tracking-widest bg-white shadow-sm hover:bg-slate-50 hover:border-slate-200 transition-all"
                                                onClick={() => handleViewDetails(prop)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review Report
                                            </Button>
                                            <div className="h-6 w-px bg-slate-200" />
                                            <PropertyActions
                                                propertyId={prop.id}
                                                ownerId={prop.owner_id}
                                                propertyTitle={prop.title}
                                            />
                                        </div>
                                        <div className="group-hover:hidden transition-all">
                                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                                <span className="text-[10px] font-black tracking-widest uppercase mb-0.5">Edit/Review</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[500px] text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center justify-center space-y-6">
                                        <div className="p-10 bg-white rounded-full shadow-2xl shadow-slate-200 blur-lg" />
                                        <div className="relative">
                                            <Building2 className="w-24 h-24 text-slate-200" />
                                            <Search className="absolute -bottom-2 -right-2 w-10 h-10 text-[#F17720] animate-bounce" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-3xl font-black text-[#0B3D6F] tracking-tighter">Zero results matched</p>
                                            <p className="text-slate-400 font-medium max-w-sm mx-auto">Try broading your search or checking a different governorate to find the listings you're looking for.</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="rounded-full px-8 h-12 font-black uppercase text-xs tracking-widest border-slate-200"
                                            onClick={() => {
                                                setQuery('')
                                                setStatus('all')
                                                setOwnerId('all')
                                                setGovernorate('all')
                                            }}
                                        >
                                            Reset View
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Property Details Review Dialog (The "Info Page") */}
            {selectedProperty && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[92vh] overflow-y-auto rounded-[3rem] border-0 p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Property Details: {selectedProperty.title}</DialogTitle>
                            <DialogDescription>Review detailed information and moderation choices for this listing.</DialogDescription>
                        </DialogHeader>
                        {/* Hero Section of Info Page */}
                        <div className="relative h-96 w-full bg-slate-900 group">
                            {selectedProperty.images?.[0] ? (
                                <Image
                                    src={selectedProperty.images[0]}
                                    alt={selectedProperty.title}
                                    fill
                                    className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[2s]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white opacity-20"><Building2 className="w-32 h-32" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
                                <Button
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 rounded-full h-12 w-12 p-0 backdrop-blur-md border border-white/20"
                                    onClick={() => setIsDetailsOpen(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                                <Button asChild variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-[#0B3D6F] rounded-full h-12 px-6 font-black uppercase text-xs tracking-widest transition-all">
                                    <Link href={`/properties/${selectedProperty.id}`} target="_blank">
                                        <ExternalLink className="w-4 h-4 mr-3" />
                                        Live View
                                    </Link>
                                </Button>
                            </div>

                            <div className="absolute bottom-12 left-12 right-12 flex flex-col lg:flex-row items-end justify-between gap-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className="bg-[#F17720] text-white border-0 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-lg shadow-orange-500/30">
                                            {selectedProperty.type} Listing
                                        </Badge>
                                        <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-black uppercase text-[10px] tracking-widest px-4 py-1.5">
                                            REF: {selectedProperty.id.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <h2 className="text-6xl font-black text-white tracking-tighter leading-none">{selectedProperty.title}</h2>
                                    <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-lg">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-[#F17720]" />
                                            {selectedProperty.city}, {selectedProperty.governorate}
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Listed {new Date(selectedProperty.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-4 shadow-2xl">
                                    <div className={`px-8 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl border backdrop-blur-xl
                                        ${selectedProperty.status === 'Published' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                        ${selectedProperty.status === 'Pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse' : ''}
                                        ${selectedProperty.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                                    `}>
                                        {selectedProperty.status} Mode
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16 bg-white">
                            <div className="lg:col-span-8 space-y-16">
                                {/* Description Area */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-2 bg-[#F17720] rounded-full" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Host Description & Intent</h4>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium text-xl whitespace-pre-wrap max-w-4xl">
                                        {selectedProperty.description || "The owner has not provided a detailed description for this property listing yet."}
                                    </p>
                                </div>

                                {/* Amenities Area */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-2 bg-[#0B3D6F] rounded-full" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Included Amenities</h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(selectedProperty.amenities || []).map((amenity: string, i: number) => (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#F17720] group-hover:scale-110 transition-transform shadow-sm">
                                                    {getAmenityIcon(amenity)}
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm truncate">{amenity}</span>
                                            </div>
                                        ))}
                                        {(!selectedProperty.amenities || selectedProperty.amenities.length === 0) && (
                                            <div className="col-span-full p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold">
                                                No amenities specified.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Geographic Intelligence (Map Preview) */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-2 bg-green-500 rounded-full" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Geographic Positioning</h4>
                                    </div>
                                    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl relative shadow-slate-200/50">
                                        {MAPBOX_TOKEN && selectedProperty.latitude && selectedProperty.longitude ? (
                                            <Map
                                                mapboxAccessToken={MAPBOX_TOKEN}
                                                initialViewState={{
                                                    longitude: selectedProperty.longitude,
                                                    latitude: selectedProperty.latitude,
                                                    zoom: 14
                                                }}
                                                style={{ width: '100%', height: '100%' }}
                                                mapStyle="mapbox://styles/mapbox/light-v11"
                                            >
                                                <Marker
                                                    longitude={selectedProperty.longitude}
                                                    latitude={selectedProperty.latitude}
                                                    anchor="bottom"
                                                >
                                                    <div className="relative group/marker">
                                                        <div className="bg-[#0B3D6F] p-3 rounded-full shadow-2xl ring-4 ring-white">
                                                            <Building2 className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-3 opacity-0 group-hover/marker:opacity-100 transition-all whitespace-nowrap bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                                            {selectedProperty.title}
                                                        </div>
                                                    </div>
                                                </Marker>
                                            </Map>
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center space-y-4">
                                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                                                    <AlertCircle className="w-10 h-10 text-slate-200" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-xl font-black text-slate-400">Map Unavailable</p>
                                                    <p className="text-slate-300 font-bold text-sm">Owner hasn't set exact coordinates for this property.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gallery Recap */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-2 bg-orange-400 rounded-full" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Asset Gallery Preview</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedProperty.images?.map((img: string, i: number) => (
                                            <div key={i} className="aspect-[4/3] relative rounded-3xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all">
                                                <Image src={img} alt={`Gallery ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-10">
                                {/* Owner Intelligence Profile */}
                                <div className="sticky top-10 space-y-10">
                                    <div className="p-10 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                                        <div className="relative z-10 space-y-8">
                                            <div className="flex flex-col items-center text-center space-y-6">
                                                <Avatar className="h-32 w-32 border-8 border-white/10 shadow-2xl shadow-black/50 ring-2 ring-[#F17720]/30 hover:scale-105 transition-transform">
                                                    <AvatarImage src={selectedProperty.profiles?.avatar_url} />
                                                    <AvatarFallback className="bg-white/10 text-white font-black text-3xl uppercase">
                                                        {selectedProperty.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-white">{selectedProperty.profiles?.full_name}</h3>
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                                                        <div className="w-2 h-2 bg-[#F17720] rounded-full animate-pulse shadow-[0_0_8px_rgba(241,119,32,0.8)]" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Verified Multi-Host</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/10">
                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group/link">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                                                            <Mail className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Contact Email</span>
                                                            <span className="text-sm font-bold text-white truncate max-w-[150px]">{selectedProperty.profiles?.email}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/link:text-white" />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group/link">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                                                            <Phone className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Direct Phone</span>
                                                            <span className="text-sm font-bold text-white">{selectedProperty.profiles?.phone || "+216 -- --- ---"}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/link:text-white" />
                                                </div>

                                                <Button className="w-full h-16 rounded-2xl bg-[#0B3D6F] text-white hover:bg-white hover:text-[#0B3D6F] border-0 font-black uppercase text-xs tracking-widest shadow-xl transition-all">
                                                    <MessageSquare className="w-5 h-5 mr-3" />
                                                    Messenger Console
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Moderator Console */}
                                    <div className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-2 bg-red-500 rounded-full" />
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Moderator Console</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400">
                                                    <History className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                                                    <p className="font-black text-slate-700 truncate">Submission Processed</p>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-[#0B3D6F] rounded-[2rem] shadow-2xl space-y-6">
                                                <p className="text-[10px] font-black text-[#F17720] text-center bg-orange-50/10 py-2 rounded-lg uppercase tracking-[0.25em]">Execution Zone</p>
                                                <PropertyActions
                                                    propertyId={selectedProperty.id}
                                                    ownerId={selectedProperty.owner_id}
                                                    propertyTitle={selectedProperty.title}
                                                    variant="full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
