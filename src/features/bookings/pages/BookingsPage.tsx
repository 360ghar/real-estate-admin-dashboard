import { useParams } from 'react-router-dom'
import BookingList from '../components/BookingList'
import BookingDetail from '../components/BookingDetail'
import { CalendarCheck, CalendarClock, CheckCircle2, XCircle } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { Badge } from '@/components/ui/badge'
import { useGetAllBookingsQuery } from '../api/bookingsApi'
import { useMemo } from 'react'

const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
    <div className={`p-2 rounded-full ${tone}`}>{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)

const BookingsPage = ({ mode }: { mode?: 'detail' }) => {
  const params = useParams()
  const { role } = useUserRole()
  const { data, isFetching } = useGetAllBookingsQuery({ limit: 1000, include_total: true }, { skip: mode === 'detail' })

  const counts = useMemo(() => {
    const items = data?.items ?? []
    const total = data?.total ?? items.length
    const upcoming = items.filter((b) => ['pending', 'confirmed'].includes(b.booking_status)).length
    const completed = items.filter((b) => b.booking_status === 'completed').length
    const cancelled = items.filter((b) => b.booking_status === 'cancelled').length
    return { total, upcoming, completed, cancelled }
  }, [data])

  if (mode === 'detail') return <BookingDetail id={Number(params.id)} />
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              Bookings
            </h1>
            <p className="text-muted-foreground">
              {role === 'agent'
                ? 'Manage bookings for your assigned properties'
                : 'Oversee all bookings across the platform'}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {role === 'admin' ? 'Admin View' : 'Agent View'}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarCheck className="h-4 w-4 text-primary" />}
            label="Total Bookings"
            value={isFetching ? '...' : counts.total}
            tone="bg-primary/10"
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            label="Upcoming"
            value={isFetching ? '...' : counts.upcoming}
            tone="bg-blue-500/10"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
            label="Completed"
            value={isFetching ? '...' : counts.completed}
            tone="bg-green-500/10"
          />
          <StatCard
            icon={<XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
            label="Cancelled"
            value={isFetching ? '...' : counts.cancelled}
            tone="bg-red-500/10"
          />
        </div>
        <p className="text-xs text-muted-foreground">Status breakdowns from the most recent 1000 bookings.</p>
      </div>

      <BookingList />
    </div>
  )
}

export default BookingsPage
