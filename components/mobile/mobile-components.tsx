'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Menu, Home, MapIcon, Heart, User, Search } from 'lucide-react'

/**
 * Mobile-Optimized Bottom Navigation Tab
 */
export function MobileNavTab({
    icon: Icon,
    label,
    isActive,
    onClick,
    badge,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    isActive?: boolean
    onClick?: () => void
    badge?: number
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-center gap-1 py-3 px-2 flex-1 transition-all duration-300 relative group',
                isActive
                    ? 'text-[#F17720]'
                    : 'text-slate-400 active:text-slate-600'
            )}
        >
            <div className="relative">
                <Icon className="w-6 h-6" />
                {badge && badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#F17720] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {badge > 9 ? '9+' : badge}
                    </div>
                )}
            </div>
            <span className={cn(
                'text-[10px] font-black tracking-widest uppercase transition-all',
                isActive ? 'text-[#F17720]' : 'text-slate-400'
            )}>
                {label}
            </span>
            {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#F17720] rounded-full" />
            )}
        </button>
    )
}

/**
 * Mobile Bottom Navigation Bar
 */
export function MobileBottomNav({
    activeTab,
    onTabChange,
    tabs = ['Explore', 'Map', 'Saved', 'Profile'],
}: {
    activeTab: string
    onTabChange: (tab: string) => void
    tabs?: string[]
}) {
    const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        Explore: Search,
        Map: MapIcon,
        Saved: Heart,
        Profile: User,
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 safe-bottom">
            <div className="flex items-center justify-between px-2">
                {tabs.map((tab) => (
                    <MobileNavTab
                        key={tab}
                        icon={tabIcons[tab] || Home}
                        label={tab}
                        isActive={activeTab === tab}
                        onClick={() => onTabChange(tab)}
                    />
                ))}
            </div>
            {/* Safe area for notch devices */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    )
}

/**
 * Mobile Header with Back Button
 */
export function MobileHeader({
    title,
    subtitle,
    onBack,
    rightAction,
    sticky = true,
}: {
    title: string
    subtitle?: string
    onBack?: () => void
    rightAction?: React.ReactNode
    sticky?: boolean
}) {
    return (
        <div className={cn(
            'md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-100 px-4 py-4',
            sticky && 'sticky top-0 z-40'
        )}>
            <div className="flex items-center justify-between gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 -m-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
                        aria-label="Go back"
                    >
                        <ChevronDown className="w-5 h-5 rotate-90 text-slate-600" />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-base font-black text-[#0B3D6F] truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-slate-500 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                {rightAction && (
                    <div className="flex-shrink-0">
                        {rightAction}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Mobile Filter Sheet (Bottom Sheet)
 */
export function MobileFilterSheet({
    isOpen,
    onClose,
    title = 'Filters',
    children,
}: {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
}) {
    if (!isOpen) return null

    return (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div
                className="flex-1 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto">
                {/* Handle bar */}
                <div className="flex items-center justify-center pt-3 pb-4">
                    <div className="w-12 h-1 bg-slate-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100">
                    <h2 className="text-lg font-black text-[#0B3D6F]">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -m-2 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Close filters"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 py-6 space-y-6 pb-[env(safe-area-inset-bottom)]">
                    {children}
                </div>
            </div>
        </div>
    )
}

/**
 * Mobile Accordion (for filters/settings)
 */
export function MobileAccordion({
    items,
    defaultOpen = 0,
}: {
    items: Array<{
        title: string
        content: React.ReactNode
        id?: string
    }>
    defaultOpen?: number
}) {
    const [openId, setOpenId] = React.useState(items[defaultOpen]?.id || '0')

    return (
        <div className="md:hidden space-y-2">
            {items.map((item, idx) => {
                const id = item.id || idx.toString()
                const isOpen = openId === id

                return (
                    <div
                        key={id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenId(isOpen ? '' : id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                        >
                            <span className="font-bold text-sm text-slate-700">
                                {item.title}
                            </span>
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 text-slate-400 transition-transform duration-300',
                                    isOpen && 'rotate-180'
                                )}
                            />
                        </button>

                        {isOpen && (
                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                                {item.content}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Mobile Touch-Friendly Button
 */
export function MobileTouchButton({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className,
    disabled = false,
    ...props
}: {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
    className?: string
    disabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const baseClasses = 'font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 md:hidden'

    const variantClasses = {
        primary: 'bg-[#0B3D6F] text-white hover:bg-[#0B3D6F]/90 active:bg-[#0B3D6F]',
        secondary: 'bg-[#F17720] text-white hover:bg-[#F17720]/90 active:bg-[#F17720]',
        outline: 'border-2 border-[#0B3D6F] text-[#0B3D6F] hover:bg-slate-50',
    }

    const sizeClasses = {
        sm: 'px-4 py-2 text-xs rounded-lg',
        md: 'px-6 py-3 text-sm rounded-xl min-h-12',
        lg: 'px-8 py-4 text-base rounded-2xl min-h-14 w-full',
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

/**
 * Mobile Card with Better Spacing
 */
export function MobileCard({
    children,
    className,
    ...props
}: {
    children: React.ReactNode
    className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'bg-white rounded-2xl p-4 border border-slate-100 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Mobile Input Field
 */
export function MobileInput({
    label,
    error,
    ...props
}: {
    label?: string
    error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="md:hidden space-y-2">
            {label && (
                <label className="block text-sm font-bold text-slate-700">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={cn(
                    'w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-base',
                    'focus:border-[#0B3D6F] focus:outline-none transition-colors',
                    'placeholder:text-slate-400',
                    error && 'border-red-500 focus:border-red-500'
                )}
            />
            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    )
}

/**
 * Mobile Select Field
 */
export function MobileSelect({
    label,
    options,
    value,
    onChange,
    error,
}: {
    label?: string
    options: Array<{ value: string | number; label: string }>
    value: string | number
    onChange: (value: string | number) => void
    error?: string
}) {
    return (
        <div className="md:hidden space-y-2">
            {label && (
                <label className="block text-sm font-bold text-slate-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        'w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-base',
                        'focus:border-[#0B3D6F] focus:outline-none transition-colors',
                        'appearance-none bg-white',
                        error && 'border-red-500'
                    )}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    )
}

/**
 * Mobile Swipe-Friendly Card List
 */
export function MobileCardList({
    items,
    renderItem,
    onScroll,
    className,
}: {
    items: any[]
    renderItem: (item: any, index: number) => React.ReactNode
    onScroll?: (scrollPosition: number) => void
    className?: string
}) {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const container = scrollRef.current
        if (!container || !onScroll) return

        const handleScroll = () => {
            onScroll(container.scrollLeft)
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [onScroll])

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4',
                'md:hidden scroll-smooth',
                className
            )}
        >
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="flex-shrink-0 w-[85vw] snap-start"
                >
                    {renderItem(item, idx)}
                </div>
            ))}
        </div>
    )
}

/**
 * Mobile Safe Area Wrapper
 */
export function MobileSafeArea({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                'md:hidden',
                className
            )}
            style={{
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >
            {children}
        </div>
    )
}

/**
 * Mobile Haptic Feedback Button
 */
export function MobileHapticButton({
    children,
    onClick,
    hapticStrength = 'medium',
    className,
    ...props
}: {
    children: React.ReactNode
    onClick?: () => void
    hapticStrength?: 'light' | 'medium' | 'heavy'
    className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback on mobile
        if (navigator.vibrate) {
            const pattern = {
                light: 10,
                medium: 20,
                heavy: 40,
            }
            navigator.vibrate(pattern[hapticStrength])
        }
        onClick?.()
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                'transition-all active:scale-95 duration-150',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

/**
 * Mobile Drawer/Sidebar
 */
export function MobileDrawer({
    isOpen,
    onClose,
    children,
    title,
}: {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}) {
    if (!isOpen) return null

    return (
        <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="flex-1 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="w-4/5 max-w-sm bg-white flex flex-col">
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h2 className="font-black text-lg text-[#0B3D6F]">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -m-2 hover:bg-slate-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
