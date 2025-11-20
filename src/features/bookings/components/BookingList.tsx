import { useMemo, useState, useEffect } from 'react'
import { useListBookingsQuery } from '@/features/bookings/api/bookingsApi'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ColumnDef,
} from '@tanstack/react-table'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { Booking } from '@/types'

const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: 'Ref',
  },
  {
    accessorKey: 'property',
    header: 'Property',
    cell: ({ row }) => row.original.property?.title || '-',
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => row.original.user?.full_name || '-',
  },
  {
    accessorKey: 'check_in_date',
    header: 'Check-in/out',
    cell: ({ row }) => {
      const checkIn = row.getValue('check_in_date') as string
      const checkOut = row.getValue('check_out_date') as string
      if (!checkIn || !checkOut) return '-'
      return `${new Date(checkIn).toLocaleDateString()} – ${new Date(checkOut).toLocaleDateString()}`
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('total_amount') as number
      return amount ? `₹${amount.toLocaleString()}` : '-'
    },
  },
  {
    accessorKey: 'booking_status',
    header: 'Status',
    cell: ({ row }) => {
      const status = (row.getValue('booking_status') as string) || row.original.status
      return <Badge variant={status === 'confirmed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>{status || '-'}</Badge>
    },
  },
  {
    accessorKey: 'payment_status',
    header: 'Payment',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const booking = row.original
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/bookings/${booking.id}`}>View</Link>
        </Button>
      )
    },
  },
]

const BookingList = () => {
  // Filter persistence
  const { filters, setFilters, clearFilters } = useFilterPersistence({
    key: 'bookings',
    defaultValue: {
      status: '',
      paymentStatus: '',
      q: '',
    }
  })

  const [status, setStatus] = useState(filters.status || '')
  const [paymentStatus, setPaymentStatus] = useState(filters.paymentStatus || '')
  const [q, setQ] = useState(filters.q || '')

  useEffect(() => {
    setFilters({ status, paymentStatus, q })
  }, [status, paymentStatus, q])

  const dq = useDebounce(q)
  const params = useMemo(() => {
    const base: any = {}
    if (status) base.status = status
    // Backend spec doesn’t support free-text booking search yet; omit q to avoid 422s
    return base
  }, [status])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isFetching, refetch } = useListBookingsQuery({ ...params, page, limit: pageSize })

  return (
    <Card>
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Payment</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search property/user" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
        <Button
          onClick={() => {
            setPage(1)
            refetch()
          }}
          disabled={isFetching}
        >
          Filter
        </Button>
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
          title="No bookings found"
          description={q || status || paymentStatus ? 'Try adjusting search or filters.' : 'Bookings will appear here once created.'}
          action={{
            label: 'Clear filters',
            onClick: () => {
              clearFilters()
              setStatus('')
              setPaymentStatus('')
              setQ('')
              setPage(1)
            },
            variant: 'outline',
          }}
          secondaryAction={{ label: 'Refresh', onClick: () => refetch(), variant: 'ghost' }}
        />
      ) : (
        <DataTable
          columns={bookingColumns}
          data={data?.results || []}
        />
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={data?.count}
        onChange={setPage}
      />
    </Card>
  )
}

export default BookingList
