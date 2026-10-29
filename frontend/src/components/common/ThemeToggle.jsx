import React from 'react'
import { Moon, Sun, Laptop, Check } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
]

export function ThemeToggle({ className }) {
  const { theme, setTheme, effectiveTheme } = useTheme()
  const ActiveIcon = effectiveTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn('rounded-md', className)}
          aria-label="Toggle theme"
        >
          <ActiveIcon
            className={cn(
              'h-[17px] w-[17px] transition-colors',
              effectiveTheme === 'dark' ? 'text-accent-amber' : 'text-primary'
            )}
            strokeWidth={1.8}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-md border-hairline font-sans">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer gap-2.5 text-[13px]"
          >
            <Icon size={15} strokeWidth={1.8} className="text-muted-foreground" />
            <span className={cn(theme === value && 'font-medium text-ink')}>{label}</span>
            {theme === value && <Check size={14} className="ml-auto text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
