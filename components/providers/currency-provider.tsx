'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Currency = 'TND' | 'EUR' | 'USD'

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    formatPrice: (priceInTnd: number) => string
    exchangeRates: Record<Currency, number>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Fallback rates in case API is down
const DEFAULT_RATES: Record<Currency, number> = {
    TND: 1,
    EUR: 0.30,
    USD: 0.32,
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    TND: 'DT',
    EUR: '€',
    USD: '$',
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('TND')
    const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES)

    useEffect(() => {
        const storedCurrency = localStorage.getItem('currency') as Currency
        if (storedCurrency && ['TND', 'EUR', 'USD'].includes(storedCurrency)) {
            setCurrency(storedCurrency)
        }

        // Fetch live rates
        const fetchRates = async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/TND')
                const data = await response.json()

                if (data && data.rates) {
                    setRates({
                        TND: 1,
                        EUR: data.rates.EUR || DEFAULT_RATES.EUR,
                        USD: data.rates.USD || DEFAULT_RATES.USD,
                    })
                }
            } catch (error) {
                console.error('Failed to fetch live exchange rates:', error)
                // Fallback to defaults already set in state
            }
        }

        fetchRates()
    }, [])

    const handleSetCurrency = (newCurrency: Currency) => {
        setCurrency(newCurrency)
        localStorage.setItem('currency', newCurrency)
    }

    const formatPrice = (priceInTnd: number) => {
        const converted = Math.round(priceInTnd * rates[currency])
        const symbol = CURRENCY_SYMBOLS[currency]

        if (currency === 'TND') {
            return `${converted.toLocaleString()} ${symbol}`
        }

        return `${symbol}${converted.toLocaleString()}`
    }

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency: handleSetCurrency,
            formatPrice,
            exchangeRates: rates
        }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}
