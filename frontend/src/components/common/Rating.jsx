import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Rating = ({ value = 0, count, size = 14, showNumber = true, className }) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Star size={size} className="fill-accent-amber text-accent-amber" strokeWidth={1.5} />
      {showNumber && (
        <span className="text-sm font-medium tabular-nums text-ink">
          {Number(value).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs font-normal text-muted-foreground">({count})</span>
      )}
    </div>
  )
}
