import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useListUsersQuery } from '@/store/services/usersApi'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from 'react-router-dom'
import { useListAgentsQuery } from '@/store/services/agentsApi'
import Pagination from '@/components/ui/pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'
import Combobox from '@/components/ui/combobox'
import { EmptyState } from '@/components/ui/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  ColumnDef 
} from '@tanstack/react-table'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { DataTable } from '@/components/ui/data-table'

const UserList = () => {
  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')

  // Filter persistence
  const { filters, setFilters } = useFilterPersistence({
    key: 'users',
    defaultValue: {
      q: '',
      agentId: '',
    }
  })

  const [q, setQ] = useState(filters.q || '')
  const [agentId, setAgentId] = useState<number | ''>(filters.agentId ? Number(filters.agentId) : '')

  useEffect(() => {
    setFilters({ q, agentId: agentId ? String(agentId) : '' })
  }, [q, agentId])

  const dq = useDebounce(q)
  const params = useMemo(() => {
    const base: any = {}
    if (dq) base.q = dq
    if (role === 'agent' && me?.agent_id) base.agent_id = me.agent_id
    if (role === 'admin' && agentId) base.agent_id = agentId
    return base
  }, [dq, agentId, role, me?.agent_id])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isFetching, error, refetch } = useListUsersQuery({ ...params, page, limit: pageSize })
  const agents = useListAgentsQuery(
    { include_inactive: false },
    { skip: role !== 'admin' }
  )

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => row.original.full_name || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: 'Assigned Agent',
      cell: ({ row }) => row.original.agent?.name || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link className="text-blue-600 hover:underline" to={`/users/${row.original.id}`}>
          View
        </Link>
      ),
    },
  ]

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input placeholder="Search name, phone, email" value={q} onChange={(e) => setQ(e.target.value)} />
        {role === 'admin' && (
          <Combobox
            items={[{ value: '' as any, label: 'All Agents' }, ...(agents.data?.results || []).map((a) => ({ value: String(a.id), label: a.name }))]}
            value={String(agentId)}
            onChange={(v) => setAgentId(v ? Number(v) : '')}
            placeholder="Filter agents…"
          />
        )}
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
          title="No users found"
          description={q || agentId ? 'Try adjusting search or filters.' : 'Users will appear here once available.'}
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

export default UserList
