import { useEffect, useMemo, useState } from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { useGetAllVisitsQuery } from '@/features/visits/api/visitsApi'
import type { VisitsQuery } from '@/features/visits/api/visitsApi'
import type { Visit } from '@/types/api'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'
import CursorPager from '@/components/ui/cursor-pager'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { formatDateTime } from '@/lib/format'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  ColumnDef 
} from '@tanstack/react-table'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { DataTable, SortableHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { downloadCsv, csvFilename } from '@/lib/csv'

const VisitList = () => {
  const { user: me, role } = useUserRole()

  // Filter persistence
  const { filters, setFilters } = useFilterPersistence({
    key: 'visits',
    defaultValue: {
      status: '',
      q: '',
    }
  })

  const [status, setStatus] = useState(filters.status || '')
  const [q, setQ] = useState(filters.q || '')

  useEffect(() => {
    setFilters({ status, q })
  }, [status, q, setFilters])

  const dq = useDebounce(q)

  const [pageSize, setPageSize] = useState(10)
  const pager = useCursorPagination()

  useEffect(() => { pager.reset() }, [pager, status, dq])

  const params = useMemo(() => {
    const base: VisitsQuery & { q?: string } = {}
    if (status) base.status = status
    if (dq) base.q = dq
    if (role === 'agent' && me?.agent_id) base.agent_id = me.agent_id
    return base
  }, [status, dq, role, me?.agent_id])

  const { data, isFetching, isLoading, error, refetch } = useGetAllVisitsQuery({ ...params, cursor: pager.cursor, limit: pageSize })

  const handleExport = () => {
    const rows = (data?.items ?? []).map((v) => ({
      id: v.id,
      property_title: v.property?.title,
      user_name: v.user?.full_name,
      scheduled_date: v.scheduled_date,
      status: v.status,
      created_at: v.created_at,
    }))
    downloadCsv(csvFilename('visits'), rows)
  }

  const columns = useMemo<ColumnDef<Visit>[]>(() => [
    {
      accessorKey: 'property_id',
      header: ({ column }) => <SortableHeader column={column}>Property</SortableHeader>,
      cell: ({ row }) => `#${row.original.property_id}`,
    },
    {
      accessorKey: 'user_id',
      header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
      cell: ({ row }) => `#${row.original.user_id}`,
    },
    {
      accessorKey: 'scheduled_date',
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => row.original.scheduled_date ? formatDateTime(row.original.scheduled_date) : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge>{row.original.status ?? 'unknown'}</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link className="text-blue-600 dark:text-blue-400 hover:underline" to={`/visits/${row.original.id}`}>
          View
        </Link>
      ),
    },
  ], [])

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search property/user" value={q} onChange={(e) => setQ(e.target.value)} />
        <div>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)) }}>
            <SelectTrigger><SelectValue placeholder="Rows" /></SelectTrigger>
            <SelectContent>
              {[10,20,50].map(n => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isFetching || isLoading} className="gap-2 justify-self-start md:justify-self-end">
          <Download className="h-4 w-4" />Export
        </Button>
      </div>
      {error ? (
        <ErrorState title="Failed to load visits" error={error} onRetry={() => { void refetch() }} />
      ) : isLoading ? (
        <LoadingState type="card" rows={5} />
      ) : (!isFetching && (!data?.items || data.items.length === 0)) ? (
        <EmptyState
          title={q || status ? 'No results match your filters' : 'No visits found'}
          description={q || status ? 'Try adjusting search or filters.' : 'Visits will appear here once scheduled.'}
          action={{ label: 'Refresh', onClick: () => { void refetch() }, variant: 'outline' }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={data?.items || []} enableSorting />
          <CursorPager
            canPrev={pager.canPrev}
            hasMore={data?.has_more ?? false}
            loading={isFetching || isLoading}
            onPrev={pager.prev}
            onNext={() => data && pager.next(data.next_cursor)}
          />
        </>
      )}
    </Card>
  )
}

export default VisitList
