'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Mail, Phone, User, Shield, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/profile'
import { format } from 'date-fns'

interface AccountClientProps {
    profile: any
    user: any
}

export function AccountClient({ profile, user }: AccountClientProps) {
    const { t } = useLanguage()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
    })

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))

            // Auto-save the avatar URL to the profile
            const result = await updateProfile({ avatar_url: publicUrl })
            if (result.success) {
                toast.success(t.account.updateSuccess)
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast.error(t.account.updateError + ": " + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateProfile({
                full_name: formData.full_name,
                phone: formData.phone
            })

            if (result.success) {
                toast.success(t.account.updateSuccess)
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast.error(t.account.updateError + ": " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-[#0B3D6F] tracking-tight">{t.account.title}</h1>
                <p className="text-slate-500 font-medium">{t.account.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden bg-white">
                        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-4 border-slate-50 shadow-xl transition-transform group-hover:scale-105 duration-500">
                                    <AvatarImage src={formData.avatar_url} />
                                    <AvatarFallback className="bg-slate-100 text-[#0B3D6F] text-3xl font-black">
                                        {formData.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <label className="absolute bottom-1 right-1 bg-[#F17720] text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-[#d1661b] transition-all group-hover:rotate-12">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="mt-6 space-y-1">
                                <h2 className="text-xl font-black text-[#0B3D6F] uppercase tracking-tight">
                                    {formData.full_name || 'Anonymous User'}
                                </h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{profile.email}</p>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 text-[#0B3D6F] border-blue-100 font-black py-1 px-3 rounded-full uppercase text-[10px] tracking-widest">
                                    {profile.role || 'Client'}
                                </Badge>
                                {profile.is_approved && (
                                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 font-black py-1 px-3 rounded-full uppercase text-[10px] tracking-widest flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                        <div className="border-t border-slate-50 p-6 bg-slate-50/30">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{t.account.memberSince}</span>
                                <span className="text-[#0B3D6F]">{profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'N/A'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-0 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] bg-slate-900 text-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-200">
                                <Shield className="w-4 h-4" />
                                {t.account.security}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full bg-white/10 border-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-12" onClick={() => toast.info("Password reset feature coming soon")}>
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-white overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <CardTitle className="text-xl font-black text-[#0B3D6F] uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-xl text-[#F17720]">
                                    <User className="w-5 h-5" />
                                </div>
                                {t.account.personalInfo}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            {t.account.fullName}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={formData.full_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#0B3D6F] font-bold text-[#0B3D6F] pl-12"
                                                placeholder="e.g. Achref Ghozzi"
                                            />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            {t.account.email}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={profile.email}
                                                disabled
                                                className="h-14 bg-slate-100 border-slate-100 rounded-2xl font-bold text-slate-400 pl-12 cursor-not-allowed"
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            {t.account.phone}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#0B3D6F] font-bold text-[#0B3D6F] pl-12"
                                                placeholder="+216 12 345 678"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>

                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-14 px-10 rounded-2xl bg-[#0B3D6F] hover:bg-[#092d52] text-white font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 transition-all hover:-translate-y-0.5"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.account.saving}
                                            </>
                                        ) : t.account.saveChanges}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-2 border-red-50 bg-red-50/10 overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-red-500 uppercase tracking-tight flex items-center gap-3">
                                <Trash2 className="w-5 h-5" />
                                {t.account.dangerZone}
                            </CardTitle>
                            <CardDescription className="font-medium text-red-400">
                                This action is irreversible. All your data, bookings, and listings will be permanently removed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <Button variant="outline" className="h-12 border-red-200 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-2xl px-6 transition-all">
                                {t.account.deleteAccount}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
