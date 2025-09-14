export interface User {
  id: number
  supabase_user_id?: string
  email?: string | null
  full_name?: string | null
  phone?: string | null
  agent_id?: number | null
  is_active?: boolean
  is_verified?: boolean
}

export type Role = 'admin' | 'agent'

export interface Property {
  id: number
  title: string
  type?: string
  purpose?: string
  price?: number
  city?: string
  locality?: string
  status?: string
  owner_id?: number
  thumbnail_url?: string
  images?: string[]
}

export interface Visit {
  id: number
  property_id: number
  user_id: number
  agent_id?: number
  scheduled_date: string
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed'
}

export interface Booking {
  id: number
  property_id: number
  user_id: number
  check_in: string
  check_out: string
  nights: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status?: 'unpaid' | 'paid' | 'refunded'
}
