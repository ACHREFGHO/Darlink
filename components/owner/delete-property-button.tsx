'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { deleteProperty } from '@/app/actions/properties'
import { toast } from 'sonner'

interface DeletePropertyButtonProps {
    propertyId: string
    propertyTitle: string
    showLabel?: boolean
    className?: string
}

export function DeletePropertyButton({ propertyId, propertyTitle, showLabel = true, className }: DeletePropertyButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteProperty(propertyId)
            if (result.success) {
                toast.success('Property deleted successfully')
                setIsOpen(false)
            } else {
                toast.error(result.error || 'Failed to delete property')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={showLabel ? "sm" : "icon"}
                    className={cn(
                        "text-red-500 hover:text-red-700 hover:bg-red-50 group",
                        showLabel && "gap-2",
                        className
                    )}
                    title="Delete Property"
                >
                    <Trash2 className="w-4 h-4" />
                    {showLabel && "Delete"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">Delete Property?</DialogTitle>
                        <DialogDescription className="mt-2">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">"{propertyTitle}"</span>?
                            This action cannot be undone and will remove all associated data, including rooms and images.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-6 gap-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Yes, Delete Property'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
