'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { approveProperty, rejectProperty } from '@/app/admin/actions'

interface PropertyActionsProps {
    propertyId: string
    ownerId: string
    propertyTitle: string
    variant?: 'compact' | 'full'
}

import { DeletePropertyButton } from '@/components/owner/delete-property-button'

export function PropertyActions({ propertyId, ownerId, propertyTitle, variant = 'compact' }: PropertyActionsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            await approveProperty(propertyId, ownerId)
            toast.success(`${propertyTitle} approved successfully`)
        } catch (error: any) {
            toast.error("Failed to approve property")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            await rejectProperty(propertyId)
            toast.warning(`${propertyTitle} listing rejected`)
        } catch (error: any) {
            toast.error("Failed to reject property")
        } finally {
            setIsLoading(false)
        }
    }

    if (variant === 'full') {
        return (
            <div className="flex flex-col gap-3 w-full">
                <Button
                    className="h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/20"
                    onClick={handleApprove}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}
                    Approve Listing
                </Button>
                <Button
                    variant="outline"
                    className="h-14 rounded-2xl border-red-500/30 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs"
                    onClick={handleReject}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 mr-3" />}
                    Reject Submission
                </Button>
                <div className="pt-2 border-t border-white/5">
                    <DeletePropertyButton
                        propertyId={propertyId}
                        propertyTitle={propertyTitle}
                        // @ts-ignore
                        showLabel={true}
                        className="w-full h-14 rounded-2xl text-white/40 hover:text-white bg-transparent border-0 font-black"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                onClick={handleReject}
                disabled={isLoading}
                title="Reject"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                onClick={handleApprove}
                disabled={isLoading}
                title="Approve"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
        </div>
    )
}
