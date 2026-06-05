import type { ComponentType } from 'react'
import { Handshake, Home, KeyRound, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePropertyStatusBreakdown } from '@/features/core/hooks/useDashboardData'
import { formatNumber } from '@/lib/format'

interface Tile {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
}

export function PropertyQuickStats() {
  const { data, total, isLoading } = usePropertyStatusBreakdown()
  const byStatus = (value: string) => data.find((slice) => slice.value === value)?.count ?? 0

  const tiles: Tile[] = [
    { label: 'Total Properties', value: total, icon: Home },
    { label: 'Available', value: byStatus('available'), icon: TrendingUp },
    { label: 'Rented', value: byStatus('rented'), icon: KeyRound },
    { label: 'Under offer', value: byStatus('under_offer'), icon: Handshake },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <div
            key={tile.label}
            className="flex items-center gap-3 rounded-cohere-md border border-cohere-card-border bg-muted/30 p-4"
          >
            <div className="rounded-full bg-muted p-2">
              <Icon className="h-4 w-4 text-foreground/70" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tile.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight">{formatNumber(tile.value)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
