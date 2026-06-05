import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Building2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import type { ActivityEntry, ActivityKind } from '@/features/core/lib/dashboard'
import { formatRelativeTime } from '@/lib/format'

const KIND_ICON: Record<ActivityKind, ComponentType<{ className?: string }>> = {
  visit: Calendar,
  booking: BookOpen,
  property: Building2,
}

interface RecentActivityCardProps {
  feed: ActivityEntry[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function RecentActivityCard({ feed, isLoading, isError, onRetry }: RecentActivityCardProps) {
  return (
    <Card className="rounded-cohere-md border-cohere-card-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Couldn't load activity" onRetry={onRetry} />
        ) : feed.length === 0 ? (
          <EmptyState title="No recent activity" description="New visits, bookings and listings will show up here." />
        ) : (
          <ul className="divide-y divide-cohere-hairline">
            {feed.map((entry) => {
              const Icon = KIND_ICON[entry.kind]
              return (
                <li key={entry.id}>
                  <Link
                    to={entry.href}
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{entry.title}</span>
                      {entry.subtitle && (
                        <span className="block truncate text-xs text-muted-foreground">{entry.subtitle}</span>
                      )}
                    </span>
                    {entry.status && (
                      <Badge variant="outline" className="hidden shrink-0 capitalize sm:inline-flex">
                        {entry.status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
