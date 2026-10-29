import React from 'react'
import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'my-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-soft/50 px-6 py-14 text-center',
        className
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-canvas text-primary">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-ink">{title}</h3>
      <p className="mb-6 mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
