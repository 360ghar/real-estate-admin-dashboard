import { LoadingState } from '@/components/ui/loading-state'

interface PageLoadingProps {
  rows?: number
  type?: 'card' | 'spinner'
}

export function PageLoading({ rows = 5, type = 'card' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState type={type} rows={rows} />
    </div>
  )
}