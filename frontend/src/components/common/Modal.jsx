import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("p-0 overflow-hidden", maxWidth)}>
        {title && (
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
