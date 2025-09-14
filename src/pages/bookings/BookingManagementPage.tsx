import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { skipToken } from '@reduxjs/toolkit/query'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetUserBookingsQuery,
  useGetUpcomingBookingsQuery,
  useGetPastBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useProcessPaymentMutation,
  useAddReviewMutation,
  useCheckAvailabilityQuery,
  useCalculatePricingQuery,
  useGetAllBookingsQuery
} from '@/store/services/bookingsApi'
import { useGetPropertyQuery } from '@/store/services/propertiesApi'
import { format, addDays, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns'
import { Calendar as CalendarIcon, MapPin, Users, DollarSign, Clock, Star, CreditCard, Plus, Edit, X, Check, AlertCircle, CalendarDays } from 'lucide-react'

const createBookingSchema = z.object({
  property_id: z.number().min(1, 'Property is required'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  check_out_date: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'Guests count is required'),
  primary_guest_name: z.string().min(1, 'Guest name is required'),
  primary_guest_phone: z.string().min(1, 'Phone number is required'),
  primary_guest_email: z.string().email('Invalid email address'),
  special_requests: z.string().optional(),
})

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review_text: z.string().optional(),
  aspects: z.object({
    cleanliness: z.number().min(1).max(5).optional(),
    location: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    accuracy: z.number().min(1).max(5).optional(),
    checkin: z.number().min(1).max(5).optional(),
  }).optional(),
})

type CreateBookingFormData = z.infer<typeof createBookingSchema>
type ReviewFormData = z.infer<typeof reviewSchema>

interface BookingCardProps {
  booking: any
  onUpdate?: (booking: any) => void
  onCancel?: (bookingId: number) => void
  onReview?: (bookingId: number, review: any) => void
  showActions?: boolean
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onUpdate, onCancel, onReview, showActions = true }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      case 'completed':
        return 'default'
      case 'refunded':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'partial':
        return 'secondary'
      case 'unpaid':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Card className={`transition-all ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.property?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {booking.property?.city}, {booking.property?.locality}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                <Badge variant={getPaymentStatusColor(booking.payment_status)}>
                  {booking.payment_status}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <span className="text-muted-foreground">Check-in:</span>
                <p className="font-medium">
                  {format(parseISO(booking.check_in_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Check-out:</span>
                <p className="font-medium">
                  {format(parseISO(booking.check_out_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Guests:</span>
                <p className="font-medium">{booking.guests}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-medium">₹{booking.total_amount.toLocaleString()}</p>
              </div>
            </div>

            {booking.special_requests && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Special Requests:</strong> {booking.special_requests}
                </p>
              </div>
            )}

            {showDetails && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Primary Guest:</span>
                    <p className="font-medium">{booking.primary_guest_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.primary_guest_phone}</p>
                    <p className="text-sm text-muted-foreground">{booking.primary_guest_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Details:</span>
                    <p className="text-sm">Method: {booking.payment_method || 'N/A'}</p>
                    <p className="text-sm">Transaction ID: {booking.transaction_id || 'N/A'}</p>
                    {booking.paid_at && (
                      <p className="text-sm">
                        Paid on: {format(parseISO(booking.paid_at), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base Price:</span>
                    <p>₹{booking.base_price.toLocaleString()} × {booking.total_nights} nights</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Taxes & Fees:</span>
                    <p>₹{(booking.taxes + booking.service_fee).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-semibold">₹{booking.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                {booking.review && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < booking.review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{booking.review.rating}/5</span>
                    </div>
                    {booking.review.review_text && (
                      <p className="text-sm">{booking.review.review_text}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-48">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>

            {showActions && booking.status === 'confirmed' && booking.payment_status !== 'paid' && (
              <Button
                size="sm"
                onClick={() => onUpdate?.(booking)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            )}

            {showActions && booking.status === 'confirmed' && !booking.review && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Add Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Review</DialogTitle>
                    <DialogDescription>
                      Share your experience with this property
                    </DialogDescription>
                  </DialogHeader>
                  <BookingReviewForm
                    onSubmit={(review) => onReview?.(booking.id, review)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {showActions && ['confirmed', 'pending'].includes(booking.status) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel?.(booking.id)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const BookingReviewForm: React.FC<{ onSubmit: (data: ReviewFormData) => void }> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      aspects: {
        cleanliness: 5,
        location: 5,
        value: 5,
        communication: 5,
        accuracy: 5,
        checkin: 5,
      },
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Overall Rating</Label>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map((rating) => (
            <label key={rating} className="cursor-pointer">
              <input
                type="radio"
                {...register('rating', { valueAsNumber: true })}
                value={rating}
                className="sr-only"
              />
              <Star
                className={`h-6 w-6 ${
                  rating <= (watch('rating') || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </label>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review_text">Review (Optional)</Label>
        <Textarea
          id="review_text"
          {...register('review_text')}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries({
          cleanliness: 'Cleanliness',
          location: 'Location',
          value: 'Value',
          communication: 'Communication',
          accuracy: 'Accuracy',
          checkin: 'Check-in',
        }).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Select
              {...(register(`aspects.${key}` as any, { valueAsNumber: true }) as any)}
              defaultValue="5"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(rating => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}

const CreateBookingDialog: React.FC<{ propertyId?: number; onSuccess?: () => void }> = ({ propertyId, onSuccess }) => {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })

  const [pricingInfo, setPricingInfo] = useState<any>(null)
  const [availabilityInfo, setAvailabilityInfo] = useState<any>(null)

  const { data: property } = useGetPropertyQuery(propertyId || 0, {
    skip: !propertyId || !isOpen,
  })

  const checkAvailability = useCheckAvailabilityQuery(
    propertyId && selectedDates.from && selectedDates.to
      ? {
          property_id: propertyId,
          check_in_date: selectedDates.from.toISOString(),
          check_out_date: selectedDates.to.toISOString(),
        }
      : skipToken
  )

  const calculatePricing = useCalculatePricingQuery(
    propertyId && selectedDates.from && selectedDates.to
      ? {
          property_id: propertyId,
          check_in_date: selectedDates.from.toISOString(),
          check_out_date: selectedDates.to.toISOString(),
        }
      : skipToken
  )

  const [createBooking] = useCreateBookingMutation()

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guests: 1,
    },
  })

  useEffect(() => {
    if (checkAvailability.data) {
      setAvailabilityInfo(checkAvailability.data)
    }
  }, [checkAvailability.data])

  useEffect(() => {
    if (calculatePricing.data) {
      setPricingInfo(calculatePricing.data)
    }
  }, [calculatePricing.data])

  const onSubmit = async (data: CreateBookingFormData) => {
    try {
      await createBooking({
        ...data,
        check_in_date: selectedDates.from!.toISOString(),
        check_out_date: selectedDates.to!.toISOString(),
      }).unwrap()
      toast({
        title: 'Booking Created',
        description: 'Your booking has been created successfully.',
      })
      setIsOpen(false)
      form.reset()
      setSelectedDates({ from: undefined, to: undefined })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Select dates and enter guest details for your booking
          </DialogDescription>
        </DialogHeader>

        {property && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <img
                  src={property.main_image_url || '/placeholder-property.jpg'}
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.locality}
                  </p>
                  <p className="text-sm font-medium">₹{property.base_price.toLocaleString()}/night</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <Label className="text-base">Select Dates</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDates.from}
                  onSelect={(date) => {
                    setSelectedDates(prev => ({ ...prev, from: date }))
                    if (date && selectedDates.to && isAfter(date, selectedDates.to)) {
                      setSelectedDates(prev => ({ ...prev, to: undefined }))
                    }
                  }}
                  disabled={(date) => isBefore(date, new Date())}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDates.to}
                  onSelect={(date) => setSelectedDates(prev => ({ ...prev, to: date }))}
                  disabled={(date) => !selectedDates.from || isBefore(date, selectedDates.from)}
                />
              </div>
            </div>

            {selectedDates.from && selectedDates.to && (
              <div className="text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                {differenceInDays(selectedDates.to, selectedDates.from)} nights
              </div>
            )}

            {availabilityInfo && !availabilityInfo.is_available && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Property is not available for selected dates
                </p>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          {pricingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price (₹{pricingInfo.base_price} × {pricingInfo.total_nights} nights)</span>
                  <span>₹{pricingInfo.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span>₹{pricingInfo.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>₹{pricingInfo.service_fee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{pricingInfo.total_amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guest Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={property?.max_occupancy || 10}
                {...form.register('guests', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_guest_name">Primary Guest Name</Label>
              <Input
                id="primary_guest_name"
                {...form.register('primary_guest_name')}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_guest_phone">Phone Number</Label>
              <Input
                id="primary_guest_phone"
                {...form.register('primary_guest_phone')}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_guest_email">Email Address</Label>
              <Input
                id="primary_guest_email"
                type="email"
                {...form.register('primary_guest_email')}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests (Optional)</Label>
            <Textarea
              id="special_requests"
              {...form.register('special_requests')}
              placeholder="Any special requirements or requests..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!selectedDates.from || !selectedDates.to || !availabilityInfo?.is_available}
              className="flex-1"
            >
              Create Booking
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const BookingManagementPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // API calls
  const { data: userBookings, refetch: refetchUserBookings } = useGetUserBookingsQuery()
  const { data: upcomingBookings } = useGetUpcomingBookingsQuery()
  const { data: pastBookings } = useGetPastBookingsQuery()

  // Admin/Agent view
  const { data: allBookings, refetch: refetchAllBookings } = useGetAllBookingsQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter },
    { skip: user?.role === 'user' }
  )

  // Mutations
  const [cancelBooking] = useCancelBookingMutation()
  const [processPayment] = useProcessPaymentMutation()
  const [addReview] = useAddReviewMutation()

  const bookings = user?.role === 'user' ? userBookings?.bookings || [] : allBookings?.items || []

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
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await cancelBooking({
        bookingId,
        reason: 'Cancelled by user',
      }).unwrap()
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      })
      refetchUserBookings()
      refetchAllBookings()
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleProcessPayment = async (booking: any) => {
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
      refetchUserBookings()
      refetchAllBookings()
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddReview = async (bookingId: number, review: any) => {
    try {
      await addReview({
        bookingId,
        reviewData: review,
      }).unwrap()
      toast({
        title: 'Review Added',
        description: 'Thank you for your review!',
      })
      refetchUserBookings()
      refetchAllBookings()
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
            refetchUserBookings()
            refetchAllBookings()
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
              <div className="text-2xl font-bold">{userBookings.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBookings.upcoming}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBookings.past}</div>
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
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first booking to get started'}
                </p>
                {user?.role !== 'admin' && (
                  <CreateBookingDialog onSuccess={() => {
                    refetchUserBookings()
                    refetchAllBookings()
                  }} />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdate={handleProcessPayment}
              onCancel={handleCancelBooking}
              onReview={handleAddReview}
              showActions={user?.role !== 'admin'}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default BookingManagementPage
