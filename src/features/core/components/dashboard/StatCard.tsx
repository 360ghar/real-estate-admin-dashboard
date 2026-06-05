import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon?: ComponentType<{ className?: string }>
  /** Optional real, factual subtitle (e.g. "of 1,204 total"). Never a fabricated delta. */
  hint?: string
  isLoading?: boolean
  /** When set, the whole card links here. */
  to?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, hint, isLoading = false, to, className }: StatCardProps) {
  const body = (
    <Card
      className={cn(
        'h-full rounded-cohere-md border-cohere-card-border transition-colors',
        to && 'hover:border-cohere-hairline hover:bg-muted/40',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="rounded-full bg-muted p-2">
            <Icon className="h-4 w-4 text-foreground/70" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            {hint && <Skeleton className="h-3 w-16" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )

  if (to && !isLoading) {
    return (
      <Link to={to} className="block rounded-cohere-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {body}
      </Link>
    )
  }
  return body
}
