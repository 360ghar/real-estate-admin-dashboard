import { LoadingSpinner } from './loading-spinner'

interface LoadingStateProps {
  type?: 'skeleton' | 'spinner' | 'card' | 'cards' | 'table'
  rows?: number
  height?: string
  /** Number of columns for table skeleton */
  columns?: number
  text?: string
  className?: string
}

export function LoadingState({
  type = 'skeleton',
  rows = 5,
  height = 'h-16',
  columns = 4,
  text,
  className = ''
}: LoadingStateProps) {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" text={text || 'Loading...'} />
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`space-y-4 p-6 ${className}`}>
        <div className="h-10 bg-muted animate-pulse rounded" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`${height} bg-muted animate-pulse rounded`} />
        ))}
      </div>
    )
  }

  // Mobile cards skeleton - mimics card list view
  if (type === 'cards') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl bg-card">
            <div className="flex gap-3">
              {/* Thumbnail skeleton */}
              <div className="w-24 h-24 flex-shrink-0 rounded-md bg-muted animate-pulse" />
              {/* Content skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="flex gap-3">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
              </div>
            </div>
            {/* Action buttons skeleton */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <div className="h-11 w-11 bg-muted animate-pulse rounded" />
              <div className="h-11 w-11 bg-muted animate-pulse rounded" />
              <div className="h-11 w-11 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Table skeleton - mimics a data table with header and rows
  if (type === 'table') {
    const widths = ['w-3/12', 'w-4/12', 'w-2/12', 'w-3/12']
    return (
      <div className={`rounded-md border ${className}`}>
        <div className="border-b px-4 py-3 bg-muted/50">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-muted animate-pulse rounded ${widths[i % widths.length]}`}
              />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-4 border-b px-4 py-4 ${i === rows - 1 ? 'border-b-0' : ''}`}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className={`h-4 bg-muted animate-pulse rounded ${widths[j % widths.length]}`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Default skeleton type
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-muted animate-pulse rounded" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}