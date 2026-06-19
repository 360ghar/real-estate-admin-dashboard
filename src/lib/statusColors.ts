import type { BadgeProps } from '@/components/ui/badge'

/**
 * Shared status-to-Badge variant mapper. Used by BookingCard, VisitCard,
 * and any other component that displays entity statuses as badges.
 */

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'refunded'
type BookingPaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded'
type VisitStatus = 'scheduled' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show'

const BOOKING_STATUS_COLORS: Record<BookingStatus, BadgeProps['variant']> = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'default',
  refunded: 'outline',
}

const BOOKING_PAYMENT_STATUS_COLORS: Record<BookingPaymentStatus, BadgeProps['variant']> = {
  paid: 'default',
  partial: 'secondary',
  unpaid: 'destructive',
  refunded: 'outline',
}

const VISIT_STATUS_COLORS: Record<VisitStatus, BadgeProps['variant']> = {
  scheduled: 'default',
  confirmed: 'default',
  rescheduled: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
  no_show: 'secondary',
}

export function getBookingStatusColor(status: string): BadgeProps['variant'] {
  return BOOKING_STATUS_COLORS[status as BookingStatus] ?? 'outline'
}

export function getBookingPaymentStatusColor(status: string): BadgeProps['variant'] {
  return BOOKING_PAYMENT_STATUS_COLORS[status as BookingPaymentStatus] ?? 'outline'
}

export function getVisitStatusColor(status: string): BadgeProps['variant'] {
  return VISIT_STATUS_COLORS[status as VisitStatus] ?? 'outline'
}
