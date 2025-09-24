import { useMemo, useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useListVisitsQuery } from '@/store/services/visitsApi'
import { Input } from '@/components/ui/input'
// using native select for simplicity here
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ColumnDef 
} from '@tanstack/react-table'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { DataTable } from '@/components/ui/data-table'
import { LoadingState } from '@/components/ui/loading-state'
import { Badge } from '@/components/ui/badge'

const VisitList = () => {
  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')

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
  }, [status, q])

  const dq = useDebounce(q)
  const params = useMemo(() => {
    const base: any = {}
    if (status) base.status = status
    if (dq) base.q = dq
    if (role === 'agent' && me?.agent_id) base.agent_id = me.agent_id
    return base
  }, [status, dq, role, me?.agent_id])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isFetching, refetch } = useListVisitsQuery({ ...params, page, limit: pageSize })

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'property_id',
      header: 'Property',
      cell: ({ row }) => `#${row.original.property_id}`,
    },
    {
      accessorKey: 'user_id',
      header: 'User',
      cell: ({ row }) => `#${row.original.user_id}`,
    },
    {
      accessorKey: 'scheduled_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.scheduled_date).toLocaleString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link className="text-blue-600 hover:underline" to={`/visits/${row.original.id}`}>
          View
        </Link>
      ),
    },
  ]

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
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
            <SelectTrigger><SelectValue placeholder="Rows" /></SelectTrigger>
            <SelectContent>
              {[10,20,50].map(n => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {(!isFetching && (!data?.results || data.results.length === 0)) ? (
        <EmptyState
          title="No visits found"
          description={q || status ? 'Try adjusting search or filters.' : 'Visits will appear here once scheduled.'}
          action={{ label: 'Refresh', onClick: () => refetch(), variant: 'outline' }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={data?.results || []} />
          <Pagination page={page} pageSize={pageSize} total={data?.count} onChange={setPage} />
        </>
      )}
    </Card>
  )
}

export default VisitList
