import { useEffect, useMemo, useState } from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import type { UsersQuery } from '@/features/users/api/usersApi'
import type { User } from '@/types/api'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { useListAgentsQuery } from '@/features/agents/api/agentsApi'
import CursorPager from '@/components/ui/cursor-pager'
import { useDebounce } from '@/hooks/useDebounce'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import Combobox from '@/components/ui/combobox'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ColumnDef 
} from '@tanstack/react-table'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { DataTable, SortableHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { downloadCsv, csvFilename } from '@/lib/csv'

const UserList = () => {
  const { user: me, role } = useUserRole()

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
  }, [q, agentId, setFilters])

  const dq = useDebounce(q)

  const [pageSize, setPageSize] = useState(10)
  const pager = useCursorPagination()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { pager.reset() }, [pager.reset, dq, agentId])

  const params = useMemo(() => {
    const base: UsersQuery = {}
    if (dq) base.q = dq
    if (role === 'agent' && me?.agent_id) base.agent_id = me.agent_id
    if (role === 'admin' && agentId) base.agent_id = agentId
    return base
  }, [dq, agentId, role, me?.agent_id])

  const { data, isFetching, isLoading, error, refetch } = useGetUsersQuery({ ...params, cursor: pager.cursor, limit: pageSize })
  const agents = useListAgentsQuery(
    { include_inactive: false },
    { skip: role !== 'admin' }
  )

  const handleExport = () => {
    const rows = (data?.items ?? []).map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      is_active: u.is_active,
      is_verified: u.is_verified,
      phone_verified: u.phone_verified,
      created_at: u.created_at,
    }))
    downloadCsv(csvFilename('users'), rows)
  }

  const columns = useMemo<ColumnDef<User>[]>(() => [    {
      accessorKey: 'full_name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => row.original.full_name ?? '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone ?? '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email ?? '-',
    },
    {
      header: 'Assigned Agent',
      cell: ({ row }) => row.original.agent?.user?.full_name ?? '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link className="text-blue-600 dark:text-blue-400 hover:underline" to={`/users/${row.original.id}`}>
          View
        </Link>
      ),
    },
  ], [])

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input placeholder="Search name, phone, email" value={q} onChange={(e) => setQ(e.target.value)} />
        {role === 'admin' && (
          <Combobox
            items={[{ value: '', label: 'All Agents' }, ...(agents.data?.items || []).map((a) => ({ value: a.id, label: a.name }))]}
            value={agentId}
            onChange={(v) => setAgentId(v !== '' ? Number(v) : '')}
            placeholder="Filter agents…"
          />
        )}
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
        <ErrorState title="Failed to load users" onRetry={() => { void refetch() }} />
      ) : isLoading ? (
        <LoadingState type="card" rows={5} />
      ) : (!isFetching && (!data?.items || data.items.length === 0)) ? (
        <EmptyState
          title="No users found"
          description={q || agentId ? 'Try adjusting search or filters.' : 'Users will appear here once available.'}
          action={{ label: 'Refresh', onClick: () => { void refetch() }, variant: 'outline' }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={data?.items || []} enableSorting />
          <CursorPager
            canPrev={pager.canPrev}
            hasMore={data?.has_more ?? false}
            loading={isFetching}
            onPrev={pager.prev}
            onNext={() => data && pager.next(data.next_cursor)}
          />
        </>
      )}
    </Card>
  )
}

export default UserList
