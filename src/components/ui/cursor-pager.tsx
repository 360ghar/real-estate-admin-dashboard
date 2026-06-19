import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface CursorPagerProps {
  /** Whether a previous page exists (cursor history stack is non-empty). */
  canPrev: boolean
  /** `has_more` from the current page's response — gates the Next button. */
  hasMore: boolean
  onPrev: () => void
  onNext: () => void
  loading?: boolean
}

/**
 * Prev/Next pager driven by opaque cursors and `has_more` instead of page
 * numbers / total counts. Replaces the legacy page-number `<Pagination>`.
 */
export function CursorPager({ canPrev, hasMore, onPrev, onNext, loading }: CursorPagerProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!canPrev || loading}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasMore || loading}
        aria-label="Next page"
      >
        <span className="sr-only">Next page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default CursorPager
