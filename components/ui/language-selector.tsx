'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/language-provider'


const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const { language, setLanguage } = useLanguage()

    const selected = languages.find(l => l.code === language) || languages[0]

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full border border-white/10 bg-darlink-navy/30 text-white shadow-sm backdrop-blur-md transition-all hover:bg-darlink-navy/50 hover:text-white hover:scale-105"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="h-4 w-4" />
                <span className="uppercase tracking-widest text-xs font-semibold">{selected.code}</span>
            </Button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right rounded-xl border border-white/10 bg-darlink-navy/90 p-1 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-0.5">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-white/10 ${selected.code === lang.code ? 'bg-white/5 text-darlink-orange' : 'text-white/90'
                                    }`}
                                onClick={() => {
                                    setLanguage(lang.code as any)
                                    setIsOpen(false)
                                }}
                            >
                                <span className="text-lg leading-none">{lang.flag}</span>
                                <span className={`font-medium ${selected.code === lang.code ? 'font-semibold' : ''}`}>
                                    {lang.label}
                                </span>
                                {selected.code === lang.code && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-darlink-orange" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
