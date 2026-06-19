import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetUserBookingsQuery,
  useCancelBookingMutation,
  useProcessPaymentMutation,
  useAddReviewMutation,
  useGetAllBookingsQuery
} from '@/features/bookings/api/bookingsApi'
import { CalendarIcon, Clock, Check, AlertCircle, AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import type { Booking, BookingReview } from '@/types/api'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { CreateBookingDialog } from '@/features/bookings/components/CreateBookingDialog'

const BookingManagementPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // API calls
  const { data: userBookings, isLoading: userBookingsLoading, isError: userBookingsError, refetch: refetchUserBookings } = useGetUserBookingsQuery()

  // Admin/Agent view
  const { data: allBookings, isLoading: allBookingsLoading, isError: allBookingsError, refetch: refetchAllBookings } = useGetAllBookingsQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter },
    { skip: user?.role === 'user' }
  )

  // Mutations
  const [cancelBooking] = useCancelBookingMutation()
  const [processPayment] = useProcessPaymentMutation()
  const [addReview] = useAddReviewMutation()

  const bookings = user?.role === 'user' ? userBookings?.items || [] : allBookings?.items || []

  const filteredBookings = bookings.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        booking.property?.title.toLowerCase().includes(query) ||
        booking.primary_guest_name.toLowerCase().includes(query) ||
        booking.primary_guest_email.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await cancelBooking({ bookingId, reason: 'Cancelled by user' }).unwrap()
      toast({ title: 'Booking Cancelled', description: 'Your booking has been cancelled successfully.' })
      void refetchUserBookings()
      void refetchAllBookings()
    } catch (error) {
      toast({ title: 'Cancellation Failed', description: 'Failed to cancel booking. Please try again.', variant: 'destructive' })
    }
  }

  const handleProcessPayment = async (booking: Booking) => {
    try {
      await processPayment({
        bookingId: booking.id,
        paymentData: {
          payment_method: 'card',
          transaction_id: `txn_${Date.now()}`,
          amount: booking.total_amount,
        },
      }).unwrap()
      toast({
        title: 'Payment Processed',
        description: 'Payment has been processed successfully.',
      })
      void refetchUserBookings()
      void refetchAllBookings()
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddReview = async (bookingId: number, review: BookingReview) => {
    try {
      await addReview({
        bookingId,
        reviewData: review,
      }).unwrap()
      toast({
        title: 'Review Added',
        description: 'Thank you for your review!',
      })
      void refetchUserBookings()
      void refetchAllBookings()
    } catch (error) {
      toast({
        title: 'Review Failed',
        description: 'Failed to add review. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage your property bookings and reservations
          </p>
        </div>
        {user?.role !== 'admin' && (
          <CreateBookingDialog onSuccess={() => {
            void refetchUserBookings()
            void refetchAllBookings()
          }} />
        )}
      </div>

      {/* Stats */}
      {user?.role === 'user' && userBookings && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBookings.items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBookings.items.filter((b) => ['pending', 'confirmed'].includes(b.booking_status)).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBookings.items.filter((b) => b.booking_status === 'completed').length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {user?.role !== 'user' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking List */}
      <div className="space-y-4">
        {(userBookingsLoading || allBookingsLoading) ? (
          <LoadingState type="cards" />
        ) : (userBookingsError || allBookingsError) ? (
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title="Failed to load bookings"
            description="There was an error loading bookings. Please try again."
            action={{ label: 'Retry', onClick: () => { void refetchUserBookings(); void refetchAllBookings() }, variant: 'outline' }}
          />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="h-12 w-12" />}
            title="No bookings found"
            description={searchQuery ? 'Try adjusting your search' : 'Create your first booking to get started'}
          />
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdate={(selectedBooking) => { void handleProcessPayment(selectedBooking) }}
              onCancel={(bookingId) => { void handleCancelBooking(bookingId) }}
              onReview={(bookingId, review) => { void handleAddReview(bookingId, review) }}
              showActions={user?.role !== 'admin'}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default BookingManagementPage
