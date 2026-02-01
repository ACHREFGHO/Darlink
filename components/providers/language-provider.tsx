'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language, TranslationState } from '@/lib/i18n/translations'

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: TranslationState
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')
    const [t, setT] = useState<TranslationState>(translations.en)

    useEffect(() => {
        // Determine initial language from browser preference or fallback to 'en'
        // For simplicity, we just check local storage if implemented, or default to 'en'
        const storedLang = localStorage.getItem('language') as Language
        if (storedLang && translations[storedLang]) {
            setLanguage(storedLang)
            setT(translations[storedLang])
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        setT(translations[lang])
        localStorage.setItem('language', lang)

        // Handle RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl'
            document.documentElement.lang = 'ar'
        } else {
            document.documentElement.dir = 'ltr'
            document.documentElement.lang = lang
        }
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
