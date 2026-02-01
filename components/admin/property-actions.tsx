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
}

export function PropertyActions({ propertyId, ownerId, propertyTitle }: PropertyActionsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            await approveProperty(propertyId, ownerId)
            toast.success(`Approving ${propertyTitle}...`)
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to approve property. Check permissions.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            await rejectProperty(propertyId)
            toast.warning(`Rejected ${propertyTitle}`)
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to reject property")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleReject}
                disabled={isLoading}
                title="Reject"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleApprove}
                disabled={isLoading}
                title="Approve"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
        </div>
    )
}
