'use client'

import React from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Language } from '@/lib/i18n/translations'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

const LANGUAGES: { code: Language; name: string; flag: string; nativeName: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳', nativeName: 'العربية' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', nativeName: 'Nederlands' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
]

interface LanguageSwitcherProps {
    variant?: 'compact' | 'full' | 'mobile'
    className?: string
}

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage()
    const currentLang = LANGUAGES.find(lang => lang.code === language)

    if (variant === 'mobile') {
        return (
            <div className="space-y-2 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">Select Language</p>
                {LANGUAGES.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 transition-all text-left",
                            language === lang.code
                                ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <span className="text-xl">{lang.flag}</span>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{lang.name}</p>
                            <p className="text-xs opacity-75">{lang.nativeName}</p>
                        </div>
                        {language === lang.code && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "gap-2 text-xs font-black uppercase tracking-widest",
                        variant === 'full' ? "px-4 py-2 h-auto" : "px-2 py-1"
                    )}
                >
                    <span className="text-lg">{currentLang?.flag}</span>
                    {variant === 'full' && <span>{currentLang?.name}</span>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[220px]">
                {LANGUAGES.map(lang => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                            "cursor-pointer flex items-center gap-3 text-sm",
                            language === lang.code && "bg-blue-50 text-blue-700"
                        )}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex-1">
                            <p className="font-semibold">{lang.name}</p>
                            <p className="text-xs opacity-75">{lang.nativeName}</p>
                        </div>
                        {language === lang.code && <Check className="w-4 h-4 text-blue-500 ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function LanguageGrid() {
    const { setLanguage } = useLanguage()

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {LANGUAGES.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                    <span className="text-xs font-semibold text-slate-700 text-center group-hover:text-blue-700">{lang.name}</span>
                </button>
            ))}
        </div>
    )
}
