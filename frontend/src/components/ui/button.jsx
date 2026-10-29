import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-[-0.01em] transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(20,20,19,.08)] hover:bg-primary-active",
        coral:
          "bg-coral text-ink shadow-[0_1px_0_rgba(20,20,19,.08)] hover:bg-[#b86b50] hover:text-white",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-hairline bg-canvas text-ink hover:border-ink/25 hover:bg-surface-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-surface-cream-strong",
        soft:
          "bg-surface-card text-ink hover:bg-surface-cream-strong",
        ghost:
          "text-body hover:bg-surface-soft hover:text-ink",
        dark:
          "bg-surface-dark text-on-dark border border-white/10 hover:bg-surface-dark-elevated",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-[15px]",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className="h-4 w-4" strokeWidth={1.9} />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" strokeWidth={1.9} />}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
