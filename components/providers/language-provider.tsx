'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language, TranslationState } from '@/lib/i18n/translations'

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: TranslationState
    availableLanguages: Language[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'ar', 'it', 'de', 'es', 'pt', 'nl', 'ja']

function getBrowserLanguage(): Language {
    // Get browser language
    const browserLang = navigator.language || navigator.languages[0]
    const langCode = browserLang.split('-')[0].toLowerCase()
    
    // Map browser language to supported language
    const languageMap: Record<string, Language> = {
        'en': 'en',
        'fr': 'fr',
        'ar': 'ar',
        'it': 'it',
        'de': 'de',
        'es': 'es',
        'pt': 'pt',
        'nl': 'nl',
        'ja': 'ja',
    }
    
    return languageMap[langCode] || 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [t, setT] = useState<TranslationState>(translations.en)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Only run on client side
        setMounted(true)
        
        // Determine initial language from localStorage or browser preference
        const storedLang = localStorage.getItem('language') as Language
        let initialLang: Language = 'en'
        
        if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
            initialLang = storedLang
        } else {
            // Try to detect from browser language
            const browserLang = getBrowserLanguage()
            if (SUPPORTED_LANGUAGES.includes(browserLang)) {
                initialLang = browserLang
            }
        }
        
        setLanguageState(initialLang)
        setT(translations[initialLang])
        applyLanguageSettings(initialLang)
    }, [])

    const applyLanguageSettings = (lang: Language) => {
        // Handle RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl'
            document.documentElement.lang = 'ar'
        } else {
            document.documentElement.dir = 'ltr'
            document.documentElement.lang = lang
        }
    }

    const handleSetLanguage = (lang: Language) => {
        if (!SUPPORTED_LANGUAGES.includes(lang)) return
        
        setLanguageState(lang)
        setT(translations[lang])
        localStorage.setItem('language', lang)
        applyLanguageSettings(lang)
        
        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }))
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, availableLanguages: SUPPORTED_LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        // Return default English context on server/unmounted state
        return {
            language: 'en' as Language,
            setLanguage: () => {},
            t: translations.en,
            availableLanguages: SUPPORTED_LANGUAGES,
        }
    }
    return context
}
