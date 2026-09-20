import React from "react"
import { Badge as ShadcnBadge } from "@/components/ui/badge"

export const Badge = ({ children, variant = "default", className = "" }) => {
  let mappedVariant = variant
  if (variant === "primary") mappedVariant = "default"
  if (variant === "danger") mappedVariant = "destructive"
  if (variant === "neutral") mappedVariant = "secondary"

  return (
    <ShadcnBadge variant={mappedVariant} className={className}>
      {children}
    </ShadcnBadge>
  )
}
