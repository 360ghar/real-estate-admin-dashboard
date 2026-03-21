import * as React from 'react'
import { Filter, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './sheet'
import { Button } from './button'
import { Badge } from './badge'
import { ScrollArea } from './scroll-area'
import { cn } from '@/lib/utils'

interface MobileFiltersProps {
  children: React.ReactNode
  /** Number of active filters to display on badge */
  activeCount?: number
  /** Callback when clear all is clicked */
  onClear?: () => void
  /** Callback when apply is clicked (closes sheet) */
  onApply?: () => void
  /** Custom trigger button */
  trigger?: React.ReactNode
  /** Title for the filter sheet */
  title?: string
  /** Additional class name for trigger button */
  className?: string
}

export function MobileFilters({
  children,
  activeCount = 0,
  onClear,
  onApply,
  trigger,
  title = 'Filters',
  className,
}: MobileFiltersProps) {
  const [open, setOpen] = React.useState(false)

  const handleApply = () => {
    onApply?.()
    setOpen(false)
  }

  const handleClear = () => {
    onClear?.()
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="touch"
      className={cn('gap-2', className)}
    >
      <Filter className="h-4 w-4" />
      <span>Filters</span>
      {activeCount > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5">
          {activeCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-xl flex flex-col p-0"
        swipeToClose
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle>{title}</SheetTitle>
            {activeCount > 0 && onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
            {children}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t shrink-0 bg-background">
          <Button
            onClick={handleApply}
            className="w-full"
            size="touch"
          >
            Apply Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary-foreground/20">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Filter section with label - use inside MobileFilters
 */
interface FilterSectionProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function FilterSection({ label, children, className }: FilterSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
