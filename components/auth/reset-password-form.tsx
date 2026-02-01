'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from 'next/navigation'

export function ResetPasswordForm() {
    const supabase = createClient()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<string | null>(null)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage("Passwords do not match")
            return
        }

        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({
            password,
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage(t.resetPassword.successMessage)
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
        }
        setLoading(false)
    }

    return (
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-8 shadow-lg">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                    {t.resetPassword.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t.resetPassword.description}
                </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">{t.resetPassword.newPassword}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.resetPassword.confirmPassword}</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t.resetPassword.updating : t.resetPassword.updatePassword}
                </Button>
            </form>

            {message && (
                <p className={`text-center text-sm font-medium ${message === t.resetPassword.successMessage ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    )
}
