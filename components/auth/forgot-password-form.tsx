'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useLanguage } from "@/components/providers/language-provider"

export function ForgotPasswordForm() {
    const supabase = createClient()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage(t.forgotPassword.successMessage)
        }
        setLoading(false)
    }

    return (
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-8 shadow-lg">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                    {t.forgotPassword.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t.forgotPassword.description}
                </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t.common.email}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t.forgotPassword.sending : t.forgotPassword.sendLink}
                </Button>
            </form>

            {message && (
                <p className="text-center text-sm font-medium text-primary">
                    {message}
                </p>
            )}

            <div className="text-center text-sm">
                <Link
                    href="/login"
                    className="underline hover:text-primary"
                >
                    {t.forgotPassword.backToLogin}
                </Link>
            </div>
        </div>
    )
}
