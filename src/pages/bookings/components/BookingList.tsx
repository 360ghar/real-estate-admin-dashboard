import { useMemo, useState } from 'react'
import { useListBookingsQuery } from '@/store/services/bookingsApi'
// native select for filters
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'

const BookingList = () => {
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [q, setQ] = useState('')
  const dq = useDebounce(q)
  const params = useMemo(() => {
    const base: any = {}
    if (status) base.status = status
    if (paymentStatus) base.payment_status = paymentStatus
    if (dq) base.q = dq
    return base
  }, [status, paymentStatus, dq])
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isFetching } = useListBookingsQuery({ ...params, page, page_size: pageSize })

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Payment</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search property/user" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Check-in/out</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching && (!data || !data.results) && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))}
            </>
          )}
          {data?.results?.map((b) => (
            <TableRow key={b.id}>
              <TableCell>#{b.id}</TableCell>
              <TableCell>#{b.property_id}</TableCell>
              <TableCell>#{b.user_id}</TableCell>
              <TableCell>
                {new Date(b.check_in).toLocaleDateString()} – {new Date(b.check_out).toLocaleDateString()}
              </TableCell>
              <TableCell>₹{b.total_amount}</TableCell>
              <TableCell>{b.status}</TableCell>
              <TableCell>{b.payment_status || '-'}</TableCell>
              <TableCell>
                <Link className="text-blue-600 hover:underline" to={`/bookings/${b.id}`}>View</Link>
              </TableCell>
            </TableRow>
          ))}
          {!isFetching && (!data?.results || data.results.length === 0) && (
            <TableRow>
              <TableCell className="text-slate-500" colSpan={8}>No bookings found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={data?.count} onChange={setPage} />
    </Card>
  )
}

export default BookingList
