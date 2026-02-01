
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Bed, Wifi, Car, Coffee, Star, ArrowLeft, Heart, Share2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BookingSection } from "@/components/booking/booking-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PropertyPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Property Details
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            owner:profiles(full_name, avatar_url)
        `)
        .eq('id', id)
        .single()

    if (error || !property) {
        notFound()
    }

    // Fetch Images
    const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id)
        .order('display_order', { ascending: true })

    const allImages = property.main_image_url
        ? [property.main_image_url, ...(images?.map(i => i.image_url) || []).filter(url => url !== property.main_image_url)]
        : (images?.map(i => i.image_url) || [])

    // Fetch Rooms
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', property.id)
        .order('price_per_night', { ascending: true })

    // Fetch Specs
    const { data: specs } = await supabase
        .from('property_specs')
        .select('category')
        .eq('property_id', property.id)

    // Helper to get amenities icon
    const getAmenityIcon = (category: string) => {
        const iconProps = { className: "w-6 h-6" } // inherit color
        switch (category) {
            case 'Family': return <Users {...iconProps} />
            case 'Friends': return <PartyPopperIcon {...iconProps} />
            case 'Company': return <Wifi {...iconProps} />
            case 'Romantic': return <Heart {...iconProps} />
            default: return <Star {...iconProps} />
        }
    }

    // Custom Icons
    const PartyPopperIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5.8 11.3 2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 1.96L17.04 7a2.9 2.9 0 0 1-1.96 1.96L12.8 9.77a2.9 2.9 0 0 1-1.96-1.96L10.08 4.78a2.9 2.9 0 0 0-1.96-1.96L4.78 2.08A2.9 2.9 0 0 1 2.82.12L2.08 4.78a2.9 2.9 0 0 0-1.96 1.96L.12 9.02a2.9 2.9 0 0 1 1.96 1.96l.75 2.24L7.07 9.02a2.9 2.9 0 0 0 1.96-1.96z" /></svg>
    )

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 font-sans">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
                    <Link href="/" className="flex items-center text-sm font-semibold text-slate-600 hover:text-[#F17720] transition-colors group">
                        <div className="bg-slate-100 p-2 rounded-full mr-2 group-hover:bg-orange-50 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to search
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="font-bold text-2xl text-[#0B3D6F] tracking-tight">DARLINK<span className="text-[#F17720]">.tn</span></div>
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <Share2 className="w-5 h-5 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <Heart className="w-5 h-5 text-slate-600" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Title Section */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B3D6F] mb-3 tracking-tight leading-tight">{property.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border shadow-sm">
                                    <MapPin className="w-4 h-4 text-[#F17720]" />
                                    {property.city}, {property.governorate}
                                </div>
                                <span className="hidden md:inline text-slate-300">•</span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0B3D6F] rounded-full border border-blue-100">
                                    <Star className="w-3.5 h-3.5 fill-[#0B3D6F]" />
                                    <span>New Listing</span>
                                </div>
                                <span className="hidden md:inline text-slate-300">•</span>
                                <Badge variant="secondary" className="bg-orange-50 text-[#F17720] border-orange-100 hover:bg-orange-100">
                                    {property.type}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Host Mini Badge */}
                            <div className="flex items-center gap-2 bg-white pl-1 pr-4 py-1 rounded-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={property.owner?.avatar_url} />
                                    <AvatarFallback className="bg-[#0B3D6F] text-white text-xs">{property.owner?.full_name?.[0] || 'O'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 leading-none">Hosted by</span>
                                    <span className="text-xs text-slate-500 leading-none mt-0.5">{property.owner?.full_name || 'Community Member'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Image Gallery - Mosaic Layout */}
                <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 h-[400px] md:h-[600px] bg-gray-100 animate-in fade-in zoom-in-95 duration-1000 delay-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-full gap-2 p-2">
                        {/* Main Hero Image - Takes half the grid */}
                        <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer">
                            {allImages[0] ? (
                                <img
                                    src={allImages[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>

                        {/* Secondary Images - Adaptive Layout */}
                        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
                            {allImages[1] && <img src={allImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 2" />}
                            {!allImages[1] && <div className="w-full h-full bg-slate-100" />}
                        </div>
                        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
                            {allImages[2] && <img src={allImages[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 3" />}
                            {!allImages[2] && <div className="w-full h-full bg-slate-100" />}
                        </div>
                        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
                            {allImages[3] && <img src={allImages[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 4" />}
                            {!allImages[3] && <div className="w-full h-full bg-slate-100" />}
                        </div>
                        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
                            {allImages[4] ? (
                                <>
                                    <img src={allImages[4]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 5" />
                                    {allImages.length > 5 && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-colors group-hover:bg-black/50">
                                            <span className="text-white font-bold text-2xl tracking-tight">+{allImages.length - 5} photos</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-100" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-1 bg-[#F17720] rounded-full" />
                                <h2 className="text-2xl font-bold text-[#0B3D6F]">About this stay</h2>
                            </div>
                            <p className="text-slate-600 leading-8 whitespace-pre-line text-lg font-light">
                                {property.description}
                            </p>
                        </section>

                        {/* Amenities / Specs */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-1 bg-[#0B3D6F] rounded-full" />
                                <h2 className="text-2xl font-bold text-[#0B3D6F]">What this place offers</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {specs?.map((spec: any) => {
                                    let description = "";
                                    switch (spec.category) {
                                        case 'Family': description = "Safe, spacious, and kid-friendly."; break;
                                        case 'Friends': description = "Perfect for group trips and fun."; break;
                                        case 'Company': description = "Work-ready with WiFi and desks."; break;
                                        case 'Romantic': description = "Cozy, private, and beautiful views."; break;
                                        default: description = "Enjoy a comfortable stay.";
                                    }

                                    return (
                                        <div key={spec.category} className="group flex items-start gap-4 p-5 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all hover:border-[#F17720]/30 hover:-translate-y-1 cursor-default relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#F17720]/0 to-[#F17720]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="p-3 bg-orange-50 group-hover:bg-[#F17720] group-hover:text-white rounded-2xl transition-colors duration-300 relative z-10 text-[#F17720]">
                                                {getAmenityIcon(spec.category)}
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-bold text-lg text-[#0B3D6F] group-hover:text-[#F17720] transition-colors">{spec.category}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!specs || specs.length === 0) && (
                                    <p className="text-muted-foreground italic col-span-2">This property hasn't listed specific amenities yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Host Info */}
                        <section className="bg-gradient-to-br from-[#0B3D6F] to-[#062a4d] rounded-3xl p-10 text-white relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="h-24 w-24 rounded-full border-4 border-white/20 p-1">
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={property.owner?.avatar_url} />
                                        <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">{property.owner?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-3xl font-bold">Hosted by {property.owner?.full_name || "Darlink Host"}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-blue-200 text-sm">
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4" /> Identity Verified
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Superhost
                                        </div>
                                    </div>
                                    <p className="max-w-md text-blue-100/80 leading-relaxed mt-2">
                                        Hi there! I'm dedicated to providing you with the best experience possible in Tunisia. Feel free to ask me anything!
                                    </p>
                                </div>
                                <div className="md:ml-auto">
                                    <Button className="bg-white text-[#0B3D6F] hover:bg-blue-50 font-bold px-8 h-12 rounded-full shadow-lg transition-transform hover:scale-105">
                                        Contact Host
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                            {/* Floating Booking Card */}
                            <div className="relative">
                                {/* Decorative Blur underneath */}
                                <div className="absolute inset-0 bg-[#F17720]/20 blur-2xl transform translate-y-4 rounded-3xl" />

                                <BookingSection
                                    propertyId={property.id}
                                    rooms={rooms || []}
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span>100% Secure Payment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
