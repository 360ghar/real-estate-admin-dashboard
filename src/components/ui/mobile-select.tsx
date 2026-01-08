import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { ScrollArea } from './scroll-area'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface MobileSelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  title?: string
  disabled?: boolean
  className?: string
}

/**
 * A select component that uses a bottom sheet on mobile for better UX.
 * Falls back to standard Select on desktop.
 */
export function MobileSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  title = 'Select',
  disabled = false,
  className,
}: MobileSelectProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
  }

  // Desktop: Use standard Select
  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Mobile: Use Sheet
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {displayValue}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] rounded-t-xl p-0"
        swipeToClose
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="py-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className={cn(
                  'w-full justify-start h-12 px-6 rounded-none font-normal',
                  option.value === value && 'bg-accent',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
