import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  page: number
  pageSize: number
  total?: number
  onChange: (page: number) => void
}

const Pagination = ({ page, pageSize, total = 0, onChange }: Props) => {
  const totalPages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : page
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(totalPages ? Math.min(totalPages, page + 1) : page + 1)

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages || '1'}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={next}
          disabled={!!totalPages && page >= totalPages}
        >
          <span className="sr-only">Next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination

