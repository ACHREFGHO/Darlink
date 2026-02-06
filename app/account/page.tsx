import { Navbar } from '@/components/site/navbar'
import { createClient } from '@/lib/supabase/server'
import { AccountClient } from '@/components/account/account-client'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar user={user} userRole={profile?.role || 'client'} variant="inner" />
            <main className="flex-1">
                <AccountClient profile={profile} user={user} />
            </main>
        </div>
    )
}
