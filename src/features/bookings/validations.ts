import { z } from 'zod'

// Create booking form validation schema
export const createBookingSchema = z.object({
  property_id: z.number().min(1, 'Property is required'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  check_out_date: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'Guests count is required'),
  primary_guest_name: z.string().min(1, 'Guest name is required'),
  primary_guest_phone: z.string().min(1, 'Phone number is required'),
  primary_guest_email: z.string().email('Invalid email address'),
  special_requests: z.string().optional(),
}).refine(
  (d) => !d.check_in_date || !d.check_out_date || new Date(d.check_out_date) > new Date(d.check_in_date),
  { message: 'Check-out must be after check-in', path: ['check_out_date'] },
)

// Booking review form validation schema
export const bookingReviewSchema = z.object({
  guest_rating: z.number().min(1).max(5),
  guest_review: z.string().optional(),
})

// Export inferred types
export type CreateBookingFormValues = z.infer<typeof createBookingSchema>
export type BookingReviewFormValues = z.infer<typeof bookingReviewSchema>
