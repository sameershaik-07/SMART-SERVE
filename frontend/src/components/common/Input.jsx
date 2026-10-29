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
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5 text-[11px] normal-case tracking-[0.08em] text-body">
          {label}
          {required && <span className="text-primary">*</span>}
        </Label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 z-10 text-muted-foreground">
            <Icon size={15} strokeWidth={1.8} />
          </div>
        )}
        <ShadcnInput
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={cn(
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15'
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 rounded-xs p-1 text-muted-foreground transition-colors hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  )
}
