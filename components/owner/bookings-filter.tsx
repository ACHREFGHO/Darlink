'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface Property {
    id: string
    title: string
}

interface BookingsFilterProps {
    properties: Property[]
}

export function BookingsFilter({ properties }: BookingsFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('query') || '')
    const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') || 'all')
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedQuery) {
            params.set('query', debouncedQuery)
        } else {
            params.delete('query')
        }

        if (propertyId && propertyId !== 'all') {
            params.set('propertyId', propertyId)
        } else {
            params.delete('propertyId')
        }

        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedQuery, propertyId, router, searchParams])

    const clearFilters = () => {
        setQuery('')
        setPropertyId('all')
        router.push('?', { scroll: false })
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 font-black" />
                <Input
                    placeholder="Find by guest name or property..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium transition-all"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="flex w-full lg:w-auto gap-4">
                <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger className="h-14 w-full lg:w-[280px] rounded-2xl border-slate-100 bg-slate-50/50 text-slate-600 font-bold">
                        <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                        <SelectItem value="all" className="font-bold py-3">All My Properties</SelectItem>
                        {properties.map(prop => (
                            <SelectItem key={prop.id} value={prop.id} className="font-medium py-3">
                                {prop.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {(query || (propertyId !== 'all')) && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-14 rounded-2xl text-slate-400 font-bold px-6"
                    >
                        Clear
                    </Button>
                )}
            </div>
        </div>
    )
}
