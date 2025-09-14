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

const UserList = () => {
  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')
  const [q, setQ] = useState('')
  const [agentId, setAgentId] = useState<number | ''>('')

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
  const { data, isFetching, error, refetch } = useListUsersQuery({ ...params, page, limit: pageSize } as any)
  const agents = useListAgentsQuery(
    { include_inactive: false },
    { skip: role !== 'admin' }
  )

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input placeholder="Search name, phone, email" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Agent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching && (!data || !data.results) && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))}
            </>
          )}
          {data?.results?.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.full_name || '-'}</TableCell>
              <TableCell>{u.phone || '-'}</TableCell>
              <TableCell>{u.email || '-'}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <Link className="text-blue-600 hover:underline" to={`/users/${u.id}`}>View</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      <Pagination page={page} pageSize={pageSize} total={data?.count} onChange={setPage} />
    </Card>
  )
}

export default UserList
