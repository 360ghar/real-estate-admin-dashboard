import { api } from './api'
import type { Booking } from '@/types'

export const bookingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listBookings: builder.query<{ results: Booking[]; count?: number }, Record<string, any> | void>({
      query: (params) => ({ url: '/bookings/', params: params as Record<string, any> | undefined }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((b) => ({ type: 'Booking' as const, id: b.id })),
              { type: 'Booking' as const, id: 'LIST' },
            ]
          : [{ type: 'Booking' as const, id: 'LIST' }],
    }),
    getBooking: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'Booking', id }],
    }),
    cancelBooking: builder.mutation<Booking, { id: number; reason?: string }>({
      query: ({ id, ...body }) => ({ url: '/bookings/cancel/', method: 'POST', body: { booking_id: id, ...body } }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Booking', id }, { type: 'Booking', id: 'LIST' }],
    }),
    processPayment: builder.mutation<Booking, { id: number; payment_method: string; transaction_id: string; amount: number }>({
      query: ({ id, ...body }) => ({ url: '/bookings/payment/', method: 'POST', body: { booking_id: id, ...body } }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Booking', id }],
    }),
    addReview: builder.mutation<Booking, { id: number; rating: number; review: string }>({
      query: ({ id, ...body }) => ({ url: '/bookings/review/', method: 'POST', body: { booking_id: id, ...body } }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Booking', id }],
    }),
  }),
})

export const { useListBookingsQuery, useGetBookingQuery, useCancelBookingMutation, useProcessPaymentMutation, useAddReviewMutation } = bookingsApi
