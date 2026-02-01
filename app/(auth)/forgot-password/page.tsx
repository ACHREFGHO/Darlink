'use client'

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useLanguage } from "@/components/providers/language-provider"
import Image from "next/image"

export default function ForgotPasswordPage() {
    const { t } = useLanguage()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="mb-6 flex flex-col items-center w-full">
                <div className="flex items-center gap-4 mb-2 animate-fade-in-up">
                    <Image
                        src="/images/logo_darlink.png"
                        alt="DARLINK"
                        width={180}
                        height={60}
                        className="mb-0"
                        priority
                    />
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">
                        DARLINK<span className="text-darlink-orange">.tn</span>
                    </h1>
                </div>
                <p className="text-secondary-foreground/80 font-medium tracking-wide animate-fade-in-up transition-all duration-300 hover:text-darlink-orange hover:scale-105 cursor-default">{t.forgotPassword.title}</p>
            </div>
            <ForgotPasswordForm />
        </div>
    )
}
