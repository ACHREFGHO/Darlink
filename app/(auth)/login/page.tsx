'use client'

import { AuthForm } from "@/components/auth/auth-form"
import { useLanguage } from "@/components/providers/language-provider"
import Image from "next/image"
import { useState } from "react"

export default function LoginPage() {
    const { t } = useLanguage()
    const [isRotating, setIsRotating] = useState(false)

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black">
                <Image
                    src="/images/beach-house.png"
                    alt="Login Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-8 left-8">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/logo_darlink.png"
                            alt="DARLINK"
                            width={50}
                            height={50}
                            className={`${isRotating ? 'animate-rotate' : ''}`}
                        />
                        <span className="text-2xl font-bold text-white tracking-wide">
                            DARLINK<span className="text-[#F17720]">.tn</span>
                        </span>
                    </div>
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white space-y-6">
                    <h2 className="text-4xl font-bold leading-tight max-w-lg">
                        {t.login.slogan}
                    </h2>
                    <p className="text-lg text-gray-200 max-w-md font-light">
                        {t.login.description}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-[#0B3D6F] dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <AuthForm onSuccess={() => setIsRotating(true)} />

                    <div className="text-center text-xs text-muted-foreground mt-8">
                        By clicking continue, you agree to our{' '}
                        <a href="#" className="underline hover:text-[#0B3D6F]">Terms of Service</a> and{' '}
                        <a href="#" className="underline hover:text-[#0B3D6F]">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    )
}
