import { Navbar } from '@/components/site/navbar'
import { createClient } from '@/lib/supabase/server'
import { Construction } from 'lucide-react'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Profile for Navbar
    let userRole = 'client'
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) userRole = profile.role
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={user} userRole={userRole} variant="inner" />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-24 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="bg-[#0B3D6F]/10 p-6 rounded-full inline-block">
                        <Construction className="w-12 h-12 text-[#0B3D6F]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0B3D6F]">Account Settings</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This page is currently under development. You will be able to manage your profile and preferences here soon.
                    </p>
                </div>
            </main>
        </div>
    )
}
