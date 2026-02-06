'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User } from '@supabase/supabase-js'

interface UserContextType {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
    user: null,
    profile: null,
    isLoading: true,
    signOut: async () => { },
})

export function useUser() {
    return useContext(UserContext)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        let mounted = true

        const getUser = async () => {
            setIsLoading(true)
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    setUser(session.user)

                    // Fetch profile
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (!error && data) {
                        setProfile(data as Profile)
                    } else if (error) {
                        // Check if error is "Row not found" (PGRST116)
                        if (error.code === 'PGRST116') {
                            console.log("Profile not found, creating one...")
                            // Auto-heal: Create profile if missing (CASE: User existed before trigger creation)
                            const { data: newProfile, error: createError } = await supabase
                                .from('profiles')
                                .insert({
                                    id: session.user.id,
                                    email: session.user.email,
                                    full_name: session.user.user_metadata?.full_name || '',
                                    role: 'client'
                                })
                                .select()
                                .single()

                            if (newProfile) {
                                setProfile(newProfile as Profile)
                            } else {
                                console.error("Failed to create profile (Auto-heal):", createError?.message || createError)
                            }
                        } else {
                            console.error("Error fetching profile:", error.message, error)
                        }
                    }
                } else {
                    setUser(null)
                    setProfile(null)
                }
            } catch (error) {
                console.error('Unexpected error loading user:', error)
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        getUser()

        // Safety timeout in case Supabase hangs
        const timeoutId = setTimeout(() => {
            if (mounted && isLoading) {
                console.warn("User fetching timed out, forcing loading completion")
                setIsLoading(false)
            }
        }, 8000) // 8 seconds timeout

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user)
                // Ideally re-fetch profile here too or rely on session
                // We shouldn't depend on 'profile' state here to avoid loops
                // Just fetch the profile to be safe ensuring we have the latest role
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
                if (data) setProfile(data as Profile)
            } else {
                setUser(null)
                setProfile(null)
            }
            if (mounted) setIsLoading(false)
        })

        return () => {
            mounted = false
            clearTimeout(timeoutId)
            subscription.unsubscribe()
        }
    }, [supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        window.location.href = '/login'
    }

    return (
        <UserContext.Provider value={{ user, profile, isLoading, signOut }}>
            {children}
        </UserContext.Provider>
    )
}
