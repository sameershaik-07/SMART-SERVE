import React from 'react'
import { Star } from 'lucide-react'

export const Rating = ({ value = 0, count, size = 16, showNumber = true }) => {
  return (
    <div className="flex items-center gap-1.5">
      <Star size={size} className="fill-amber-400 text-amber-400" />
      {showNumber && (
        <span className="text-sm font-semibold text-foreground">
          {Number(value).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground font-normal">
          ({count})
        </span>
      )}
    </div>
  )
}
