import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading page..." />
    </div>
  )
}