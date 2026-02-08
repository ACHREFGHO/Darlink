'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import { signOutAction } from '@/app/actions/auth'

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
            console.log("Auth State Change:", event, session?.user?.email || "No User")

            try {
                if (session?.user) {
                    setUser(session.user)
                    // Fetch profile to ensure we have the latest role
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (data) {
                        setProfile(data as Profile)
                    } else if (profileError) {
                        console.error("Error fetching profile in onAuthStateChange:", profileError)
                    }
                } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
                    setUser(null)
                    setProfile(null)
                }
            } catch (err: any) {
                if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                    console.log("Profile fetch aborted during auth change - this is normal during navigation")
                } else {
                    console.error("Unexpected error in onAuthStateChange:", err)
                }
            } finally {
                if (mounted) setIsLoading(false)
            }
        })

        return () => {
            mounted = false
            clearTimeout(timeoutId)
            subscription.unsubscribe()
        }
    }, [supabase])

    const signOut = async () => {
        try {
            // 1. Sign out on the client (Revokes session locally)
            await supabase.auth.signOut()

            // 2. Clear state immediately
            setUser(null)
            setProfile(null)

            // 3. Clear auth-related items from localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase.auth.token') || key.includes('-auth-token')) {
                    localStorage.removeItem(key)
                }
            })

            // 4. Trigger Server Action (Clears cookies on server-side)
            await signOutAction()
        } catch (error) {
            console.error('SignOut error, forcing jump to home:', error)
            // Final fallback: clear everything and redirect manually
            localStorage.clear()
            window.location.href = '/'
        }
    }

    return (
        <UserContext.Provider value={{ user, profile, isLoading, signOut }}>
            {children}
        </UserContext.Provider>
    )
}
