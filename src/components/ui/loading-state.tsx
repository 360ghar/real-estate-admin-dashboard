import { LoadingSpinner } from './loading-spinner'

interface LoadingStateProps {
  type?: 'skeleton' | 'spinner' | 'card'
  rows?: number
  height?: string
  text?: string
  className?: string
}

export function LoadingState({
  type = 'skeleton',
  rows = 5,
  height = 'h-16',
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