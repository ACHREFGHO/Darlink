'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SpinnerLoader } from './loading'

/**
 * Global page loader for route transitions
 */
export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleStart = () => setIsLoading(true)
        const handleStop = () => setIsLoading(false)

        // Listen to router changes
        window.addEventListener('beforeunload', handleStart)

        return () => {
            window.removeEventListener('beforeunload', handleStart)
        }
    }, [])

    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <SpinnerLoader size="lg" color="blue" />
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="text-sm font-bold text-slate-700"
                            >
                                Loading...
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    )
}

/**
 * Progress bar that animates during page loading
 */
export function ProgressBar() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev
                return prev + Math.random() * 30
            })
        }, 100)

        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B3D6F] via-[#F17720] to-[#0B3D6F] z-[10000]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
        />
    )
}

/**
 * Loading skeleton wrapper for content
 */
export function ContentLoader({
    isLoading,
    children,
    fallback
}: {
    isLoading: boolean
    children: React.ReactNode
    fallback?: React.ReactNode
}) {
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {fallback || (
                        <div className="space-y-4">
                            <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 bg-slate-200 rounded animate-pulse"
                                        style={{ width: i === 3 ? '60%' : '100%' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * Overlay loader for async operations
 */
export function OverlayLoader({ isVisible = false }: { isVisible?: boolean }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] flex items-center justify-center"
                >
                    <SpinnerLoader size="lg" color="blue" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
