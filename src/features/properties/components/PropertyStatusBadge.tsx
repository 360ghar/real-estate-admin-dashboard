import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PropertyStatus } from '@/types/pm'

/** Selectable statuses for inline triage (ordered by typical workflow). */
export const PROPERTY_STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'under_offer', label: 'Under offer' },
  { value: 'rented', label: 'Rented' },
  { value: 'sold', label: 'Sold' },
  { value: 'maintenance', label: 'Maintenance' },
]

const STATUS_CLASS: Record<PropertyStatus, string> = {
  available: 'bg-cohere-deep-green/10 text-cohere-deep-green',
  rented: 'bg-cohere-action-blue/10 text-cohere-action-blue',
  sold: 'bg-primary/10 text-primary',
  under_offer: 'bg-cohere-coral/15 text-cohere-coral',
  maintenance: 'bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<PropertyStatus, string> = {
  available: 'Available',
  rented: 'Rented',
  sold: 'Sold',
  under_offer: 'Under offer',
  maintenance: 'Maintenance',
}

function isPropertyStatus(value: string): value is PropertyStatus {
  return value in STATUS_CLASS
}

export function PropertyStatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const value = status ?? ''
  const known = isPropertyStatus(value)
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent capitalize',
        known ? STATUS_CLASS[value] : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {known ? STATUS_LABEL[value] : value ? value.replace(/_/g, ' ') : 'Unknown'}
    </Badge>
  )
}
