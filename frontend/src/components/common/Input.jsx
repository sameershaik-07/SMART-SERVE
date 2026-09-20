import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Input = ({
  label,
  type = 'text',
  error,
  icon: Icon,
  placeholder,
  className = '',
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <Label className="text-xs font-semibold tracking-wide flex items-center gap-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none z-10">
            <Icon size={16} />
          </div>
        )}
        <ShadcnInput
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={cn(
            Icon && "pl-9",
            isPassword && "pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-destructive font-medium">{error}</span>}
    </div>
  )
}
