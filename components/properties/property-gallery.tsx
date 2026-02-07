'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Grid, Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyGalleryProps {
    mainImageUrl: string
    images: { image_url: string; caption?: string }[]
    title: string
}

export function PropertyGallery({ mainImageUrl, images, title }: PropertyGalleryProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    // Combine main image with gallery images if not already included
    const allImages = [
        { image_url: mainImageUrl, caption: 'Main' },
        ...images
    ]

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev + 1) % allImages.length)
    }

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    return (
        <div className="relative group mb-12">
            {/* Main Grid View */}
            <div className="h-[50vh] md:h-[65vh] min-h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 grid grid-cols-1 md:grid-cols-4 gap-3 p-1 bg-slate-50">

                {/* Large Main Image */}
                <div
                    className="md:col-span-2 relative overflow-hidden group/item cursor-pointer h-full"
                    onClick={() => { setActiveIndex(0); setIsOpen(true); }}
                >
                    <img
                        src={mainImageUrl || '/placeholder.jpg'}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover/item:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors duration-500" />
                </div>

                {/* Smaller Side Images (Desktop only) */}
                <div className="hidden md:grid grid-cols-2 col-span-2 gap-3 h-full">
                    {allImages.slice(1, 5).map((img, idx) => (
                        <div
                            key={idx}
                            className="relative overflow-hidden group/item cursor-pointer h-full rounded-2xl"
                            onClick={() => { setActiveIndex(idx + 1); setIsOpen(true); }}
                        >
                            <img
                                src={img.image_url}
                                alt={`${title} ${idx + 1}`}
                                className="w-full h-full object-cover transition-all duration-700 group-hover/item:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors duration-500" />

                            {/* Overlay for "Show More" on the last image item */}
                            {idx === 3 && allImages.length > 5 && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all group-hover/item:bg-black/60">
                                    <span className="text-2xl font-black">+{allImages.length - 5}</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">More Photos</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Fallback if less than 5 images but want to keep the bento look */}
                    {allImages.length < 5 && Array.from({ length: 5 - allImages.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                            <ImageIcon className="w-8 h-8 text-slate-300 opacity-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Float Action Buttons over the image */}
            <div className="absolute bottom-8 right-8 flex gap-3">
                <Button
                    variant="outline"
                    className="bg-white/80 hover:bg-white backdrop-blur-md border-none rounded-2xl px-6 py-6 h-auto font-black text-[#0B3D6F] shadow-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => setIsOpen(true)}
                >
                    <Grid className="w-5 h-5 mr-3 text-[#F17720]" />
                    SHOW ALL PHOTOS
                </Button>
            </div>

            {/* Fullscreen Modal Slider */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black/95 gap-0 flex flex-col sm:max-w-full rounded-none">
                    <DialogTitle className="sr-only">Property Images Gallery</DialogTitle>
                    <DialogDescription className="sr-only">Viewing images for {title}</DialogDescription>

                    {/* Header bar */}
                    <div className="flex items-center justify-between p-6 z-50 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                            <span className="text-white font-black tracking-widest text-xs uppercase">
                                {activeIndex + 1} <span className="text-white/40">/</span> {allImages.length}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full h-12 w-12"
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 md:px-20">
                        {/* Nav: Prev */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 md:left-8 z-50 h-16 w-16 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-90 border border-white/10"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>

                        {/* Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center pb-24 md:pb-0">
                            <img
                                src={allImages[activeIndex].image_url}
                                alt={allImages[activeIndex].caption || title}
                                className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-500"
                            />

                            {/* Caption Overlay */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white bg-black/40 backdrop-blur-lg px-8 py-4 rounded-3xl border border-white/10 text-center min-w-[300px]">
                                <h3 className="font-black text-lg tracking-tight">{title}</h3>
                                {allImages[activeIndex].caption !== 'Main' && (
                                    <p className="text-white/60 text-sm font-medium mt-1">{allImages[activeIndex].caption}</p>
                                )}
                            </div>
                        </div>

                        {/* Nav: Next */}
                        <button
                            onClick={handleNext}
                            className="absolute right-4 md:right-8 z-50 h-16 w-16 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-90 border border-white/10"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </div>

                    {/* Thumbnail Strip (Bottom) */}
                    <div className="h-24 md:h-32 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-3 p-4 overflow-x-auto no-scrollbar">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={cn(
                                    "relative h-full aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300",
                                    activeIndex === idx
                                        ? "ring-4 ring-[#F17720] scale-105 opacity-100"
                                        : "opacity-40 hover:opacity-70 scale-95"
                                )}
                            >
                                <img src={img.image_url} className="w-full h-full object-cover" alt="thumb" />
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
