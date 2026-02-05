'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { AuthForm } from '@/components/auth/auth-form'
import { useLanguage } from '@/components/providers/language-provider'
import Image from 'next/image'

interface AuthModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    defaultView?: 'signin' | 'signup'
    onSuccess?: () => void
}

export function AuthModal({ isOpen, onOpenChange, defaultView = 'signin', onSuccess }: AuthModalProps) {
    const { t } = useLanguage()

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white gap-0">
                <div className="sr-only">
                    <DialogTitle>Authentication</DialogTitle>
                </div>
                <div className="flex flex-col">
                    {/* Header Image */}
                    <div className="relative h-32 w-full bg-[#0B3D6F]">
                        <Image
                            src="/images/beach-house.png"
                            alt="Login Banner"
                            fill
                            className="object-cover opacity-40 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                                src="/images/logo_darlink.png"
                                alt="DARLINK"
                                width={140}
                                height={50}
                                className="object-contain drop-shadow-xl brightness-0 invert"
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-[#0B3D6F]">
                                {t.login.welcomeBack}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {t.login.enterCredentials}
                            </p>
                        </div>

                        <AuthForm
                            onSuccess={() => {
                                onOpenChange(false)
                                if (onSuccess) {
                                    onSuccess()
                                } else {
                                    window.location.reload()
                                }
                            }}
                            preventRedirect={true}
                            defaultView={defaultView}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
