import * as React from "react"
import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Button = React.forwardRef(({
  children,
  variant = "default",
  fullWidth = false,
  className,
  ...props
}, ref) => {
  // Map legacy variant names if passed
  let mappedVariant = variant
  if (variant === "primary") mappedVariant = "default"
  if (variant === "danger") mappedVariant = "destructive"

  return (
    <ShadcnButton ref={ref} variant={mappedVariant} className={cn(fullWidth && "w-full", className)} {...props}>
      {children}
    </ShadcnButton>
  )
})

Button.displayName = "Button"
export { buttonVariants }
