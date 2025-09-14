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
    <div className="mt-4 flex items-center justify-between">
      <button
        className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
        onClick={prev}
        disabled={page <= 1}
      >
        Previous
      </button>
      <div className="text-sm text-slate-600">Page {page}{totalPages ? ` of ${totalPages}` : ''}</div>
      <button
        className="rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
        onClick={next}
        disabled={!!totalPages && page >= totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination

