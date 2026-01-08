import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/useMediaQuery"

type Props = {
  page: number
  pageSize: number
  total?: number
  onChange: (page: number) => void
}

const Pagination = ({ page, pageSize, total = 0, onChange }: Props) => {
  const isMobile = useIsMobile()
  const totalPages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : page
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(totalPages ? Math.min(totalPages, page + 1) : page + 1)

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      {/* Simplified on mobile */}
      <div className="text-sm text-muted-foreground">
        {isMobile ? (
          <span>{page}/{totalPages || '1'}</span>
        ) : (
          <span>Page {page} of {totalPages || '1'}</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size={isMobile ? "touch-icon" : "sm"}
          onClick={prev}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size={isMobile ? "touch-icon" : "sm"}
          onClick={next}
          disabled={!!totalPages && page >= totalPages}
          aria-label="Next page"
        >
          <span className="sr-only">Next page</span>
          <ChevronRight className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
        </Button>
      </div>
    </div>
  )
}

export default Pagination

