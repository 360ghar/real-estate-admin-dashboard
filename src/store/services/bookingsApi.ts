import { api } from './api'
import type {
  Booking,
  BookingCreate,
  BookingUpdate,
  BookingList,
  BookingAvailability,
  AvailabilityInfo,
  BookingPricing,
  BookingPayment,
  BookingReview,
  PaginatedResponse
} from '@/types/api'

export interface BookingsQuery {
  page?: number
  limit?: number
  status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
}

export const bookingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a booking
    createBooking: builder.mutation<Booking, BookingCreate>({
      query: (data) => ({
        url: '/bookings/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Booking', 'Property']
    }),

    // Get current user's bookings
    getUserBookings: builder.query<BookingList, void>({
      query: () => '/bookings/',
      providesTags: ['Booking']
    }),

    // Get upcoming bookings for current user
    getUpcomingBookings: builder.query<Booking[], void>({
      query: () => '/bookings/upcoming/',
      providesTags: ['Booking']
    }),

    // Get past bookings for current user
    getPastBookings: builder.query<Booking[], void>({
      query: () => '/bookings/past/',
      providesTags: ['Booking']
    }),

    // Check booking availability
    checkAvailability: builder.query<AvailabilityInfo, BookingAvailability>({
      query: (data) => ({
        url: '/bookings/check-availability/',
        method: 'POST',
        body: data
      })
    }),

    // Calculate booking pricing
    calculatePricing: builder.query<BookingPricing, BookingAvailability>({
      query: (data) => ({
        url: '/bookings/calculate-pricing/',
        method: 'POST',
        body: data
      })
    }),

    // Get booking details
    getBooking: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Booking', id }]
    }),

    // Update booking details
    updateBooking: builder.mutation<Booking, { id: number; data: BookingUpdate }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'Booking', id }]
    }),

    // Cancel a booking
    cancelBooking: builder.mutation<void, { bookingId: number; reason: string }>({
      query: ({ bookingId, ...data }) => ({
        url: `/bookings/cancel/`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { bookingId }) => [{ type: 'Booking', id: bookingId }]
    }),

    // Process payment for booking
    processPayment: builder.mutation<void, { bookingId: number; paymentData: BookingPayment }>({
      query: ({ bookingId, ...data }) => ({
        url: '/bookings/payment/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { bookingId }) => [{ type: 'Booking', id: bookingId }]
    }),

    // Add review to booking
    addReview: builder.mutation<void, { bookingId: number; reviewData: BookingReview }>({
      query: ({ bookingId, ...data }) => ({
        url: '/bookings/review/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { bookingId }) => [{ type: 'Booking', id: bookingId }, 'Property']
    }),

    // Get all bookings (admin/agent view)
    getAllBookings: builder.query<PaginatedResponse<Booking>, BookingsQuery>({
      query: (params) => ({
        url: '/bookings/all/',
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((b) => ({ type: 'Booking' as const, id: b.id })),
              { type: 'Booking' as const, id: 'LIST' },
            ]
          : [{ type: 'Booking' as const, id: 'LIST' }],
    }),

    // Legacy list bookings (for backward compatibility)
    listBookings: builder.query<{ results: Booking[]; count?: number }, BookingsQuery>({
      query: (params) => ({
        url: '/bookings/all/',
        params: { page: 1, limit: 20, ...params }
      }),
      transformResponse: (response: PaginatedResponse<Booking>) => ({
        results: response.items,
        count: response.total
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((b) => ({ type: 'Booking' as const, id: b.id })),
              { type: 'Booking' as const, id: 'LIST' },
            ]
          : [{ type: 'Booking' as const, id: 'LIST' }],
    }),

    // Get booking by ID (legacy)
    getBookingById: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Booking', id }]
    }),

    // Create booking (legacy)
    createBookingLegacy: builder.mutation<Booking, Omit<Booking, 'id'>>({
      query: (data) => ({
        url: '/bookings/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Booking', 'Property']
    }),

    // Update booking (legacy)
    updateBookingById: builder.mutation<Booking, { id: number; data: Partial<Booking> }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'Booking', id }]
    }),

    // Delete booking (legacy)
    deleteBooking: builder.mutation<void, number>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (res, _e, id) => [{ type: 'Booking', id }]
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useGetUpcomingBookingsQuery,
  useGetPastBookingsQuery,
  useCheckAvailabilityQuery,
  useCalculatePricingQuery,
  useGetBookingQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useProcessPaymentMutation,
  useAddReviewMutation,
  useGetAllBookingsQuery,
  useListBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingLegacyMutation,
  useUpdateBookingByIdMutation,
  useDeleteBookingMutation,
} = bookingsApi