import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-surface-card text-ink",
        destructive:
          "border-transparent bg-destructive/12 text-destructive",
        outline: "border-hairline bg-transparent text-body",
        success:
          "border-accent-teal/20 bg-accent-teal/10 text-accent-teal",
        warning:
          "border-accent-amber/25 bg-accent-amber/10 text-accent-amber",
        info:
          "border-primary/20 bg-primary/8 text-primary",
        coral:
          "border-transparent bg-coral text-ink",
        dark:
          "border-white/10 bg-surface-dark-elevated text-on-dark",
        muted:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
