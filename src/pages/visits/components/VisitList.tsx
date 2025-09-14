import { useMemo, useState } from 'react'
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
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'

const VisitList = () => {
  const me = useAppSelector(selectCurrentUser)
  const role = me?.agent_id ? 'agent' : 'admin'
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const dq = useDebounce(q)
  const params = useMemo(() => {
    const base: any = {}
    if (status) base.status = status
    if (dq) base.q = dq
    if (role === 'agent' && me?.agent_id) base.agent_id = me.agent_id
    return base
  }, [status, dq, role, me?.agent_id])

  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isFetching } = useListVisitsQuery({ ...params, page, page_size: pageSize })

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
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
        <Input placeholder="Search property/user" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
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
          {data?.results?.map((v) => (
            <TableRow key={v.id}>
              <TableCell>#{v.property_id}</TableCell>
              <TableCell>#{v.user_id}</TableCell>
              <TableCell>{new Date(v.scheduled_date).toLocaleString()}</TableCell>
              <TableCell>{v.status}</TableCell>
              <TableCell>
                <Link className="text-blue-600 hover:underline" to={`/visits/${v.id}`}>View</Link>
              </TableCell>
            </TableRow>
          ))}
          {!isFetching && (!data?.results || data.results.length === 0) && (
            <TableRow>
              <TableCell className="text-slate-500" colSpan={5}>No visits found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={data?.count} onChange={setPage} />
    </Card>
  )
}

export default VisitList
