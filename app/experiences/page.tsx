import { Navbar } from '@/components/site/navbar'
import { createClient } from '@/lib/supabase/server'
import { Palmtree } from 'lucide-react'

export default async function ExperiencesPage() {
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
                    <div className="bg-[#F17720]/10 p-6 rounded-full inline-block">
                        <Palmtree className="w-12 h-12 text-[#F17720]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0B3D6F]">Authentic Experiences</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        We are curating a list of unique local experiences. Check back soon!
                    </p>
                </div>
            </main>
        </div>
    )
}
