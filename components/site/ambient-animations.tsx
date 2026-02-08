'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function GlowingSun() {
    return (
        <motion.div
            className="absolute top-20 right-[15%] w-64 h-64 rounded-full pointer-events-none z-10"
            style={{
                background: 'radial-gradient(circle, rgba(241, 119, 32, 0.4) 0%, rgba(241, 119, 32, 0) 70%)',
                filter: 'blur(40px)',
            }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    )
}

export function AnimatedWaves() {
    return (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none">
            <svg
                className="relative block w-[calc(100%+2px)] h-[100px]"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                {/* Wave 1 - Deep base wave */}
                <motion.path
                    d="M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z"
                    fill="white"
                    opacity="0.3"
                    initial={{ x: 0 }}
                    animate={{ x: [-1200, 0] }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                {/* Wave 2 - Mid wave */}
                <motion.path
                    d="M0,70 Q300,50 600,70 T1200,70 L1200,120 L0,120 Z"
                    fill="white"
                    opacity="0.4"
                    initial={{ x: 0 }}
                    animate={{ x: [-600, 0] }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                {/* Wave 3 - Front wave */}
                <motion.path
                    d="M0,80 Q200,65 400,80 T800,80 T1200,80 L1200,120 L0,120 Z"
                    fill="white"
                    opacity="0.5"
                    initial={{ x: 0 }}
                    animate={{ x: [-800, 0] }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                {/* Wave 4 - Accent wave */}
                <motion.path
                    d="M0,85 Q250,75 500,85 T1000,85 T1500,85 L1500,120 L0,120 Z"
                    fill="white"
                    opacity="0.6"
                    initial={{ x: 0 }}
                    animate={{ x: [-400, 0] }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                {/* Wave 5 - Top wave */}
                <motion.path
                    d="M0,90 Q150,80 300,90 T600,90 T900,90 T1200,90 L1200,120 L0,120 Z"
                    fill="white"
                    initial={{ x: 0 }}
                    animate={{ x: [-600, 0] }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </svg>
        </div>
    )
}

export function FloatingLeaves() {
    const [leaves, setLeaves] = useState<Array<{ initialLeft: number; delay: number; duration: number }>>([])

    useEffect(() => {
        // Generate random values only on client after mount
        const generatedLeaves = [...Array(6)].map((_, i) => ({
            initialLeft: Math.random() * 100,
            delay: i * 2,
            duration: 12 + Math.random() * 5
        }))
        setLeaves(generatedLeaves)
    }, [])

    // Render placeholder on server to match initial client state
    if (leaves.length === 0) {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-4 h-4 text-emerald-800/20"
                        style={{
                            top: -20,
                            left: '0%',
                            opacity: 0
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                        </svg>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {leaves.map((leaf, i) => (
                <motion.div
                    key={i}
                    className="absolute w-4 h-4 text-emerald-800/20"
                    initial={{
                        top: -20,
                        left: `${leaf.initialLeft}%`,
                        rotate: 0,
                        opacity: 0
                    }}
                    animate={{
                        top: '120%',
                        left: `${(i * 20) + (Math.sin(i) * 10)}%`,
                        rotate: 360,
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: leaf.duration,
                        repeat: Infinity,
                        delay: leaf.delay,
                        ease: "linear"
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                    </svg>
                </motion.div>
            ))}
        </div>
    )
}
