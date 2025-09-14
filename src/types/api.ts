// Core Types
export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// User Types
export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: 'user' | 'agent' | 'admin'
  is_active: boolean
  is_verified?: boolean
  agent_id?: number
  agent?: Agent
  created_at: string
  updated_at: string
  profile_image_url?: string
  date_of_birth?: string
  current_latitude?: number
  current_longitude?: number
  preferred_locations?: string[]
  notification_settings?: UserNotificationSettings
  privacy_settings?: UserPrivacySettings
  preferences?: UserPreferences
}

export interface UserPreferences {
  property_type: string[]
  purpose: 'buy' | 'rent' | 'short_stay'
  budget_min: number
  budget_max: number
  bedrooms_min: number
  bedrooms_max: number
  area_min: number
  area_max: number
  location_preference: string[]
  max_distance_km: number
}

export interface UserNotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  visit_reminders: boolean
  booking_updates: boolean
  price_alerts: boolean
  new_properties: boolean
}

export interface UserPrivacySettings {
  profile_visibility: 'public' | 'agents_only' | 'private'
  show_phone: boolean
  show_email: boolean
  allow_location_tracking: boolean
  data_sharing_consent: boolean
}

export interface UserUpdate {
  email?: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  profile_image_url?: string
  preferences?: UserPreferences
  current_latitude?: number
  current_longitude?: number
  preferred_locations?: string[]
  notification_settings?: UserNotificationSettings
  privacy_settings?: UserPrivacySettings
}

// Agent Types
export interface Agent {
  id: number
  user_id: number
  employee_id: string
  specialization: string
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level: 'junior' | 'intermediate' | 'expert'
  years_of_experience: number
  bio?: string
  languages: string[]
  working_hours: WorkingHours
  commission_rate: number
  service_areas: string[]
  max_clients: number
  is_available: boolean
  performance_metrics: AgentPerformanceMetrics
  created_at: string
  updated_at: string
  user?: User
}

export interface WorkingHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface AgentPerformanceMetrics {
  total_properties_sold: number
  total_properties_rented: number
  total_commission_earned: number
  average_response_time: number
  client_satisfaction_score: number
  properties_handled: number
  visits_completed: number
  bookings_converted: number
}

export interface AgentCreate {
  user_id: number
  employee_id: string
  specialization: string
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level?: 'junior' | 'intermediate' | 'expert'
  years_of_experience?: number
  bio?: string
  languages?: string[]
  working_hours?: WorkingHours
  commission_rate?: number
  service_areas?: string[]
  max_clients?: number
  is_available?: boolean
  performance_metrics?: Partial<AgentPerformanceMetrics>
}

export interface AgentWorkload {
  agent_id: number
  agent_name: string
  active_clients: number
  pending_visits: number
  active_bookings: number
  utilization_rate: number
  max_capacity: number
}

export interface AgentSystemStats {
  total_agents: number
  active_agents: number
  average_clients_per_agent: number
  total_clients_assigned: number
  workload_distribution: Record<string, number>
  performance_metrics: Record<string, number>
}

// Property Types
export interface Property {
  id: number
  title: string
  description: string
  property_type: 'house' | 'apartment' | 'builder_floor' | 'room'
  purpose: 'buy' | 'rent' | 'short_stay'
  base_price: number
  location: {
    latitude: number
    longitude: number
  }
  city: string
  locality: string
  pincode: string
  area_sqft: number
  bedrooms: number
  bathrooms: number
  balconies?: number
  parking_spaces?: number
  floor_number?: number
  total_floors?: number
  age_of_property?: number
  max_occupancy?: number
  minimum_stay_days?: number
  amenities: Amenity[]
  features: string[]
  images: PropertyImage[]
  main_image_url?: string
  owner_id: number
  owner_name?: string
  owner_contact?: string
  status: 'available' | 'rented' | 'sold' | 'maintenance'
  liked?: boolean
  user_has_scheduled_visit?: boolean
  user_scheduled_visit_count?: number
  user_next_visit_date?: string
  distance?: number
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: number
  url: string
  is_main: boolean
  caption?: string
  order: number
}

export interface Amenity {
  id: number
  name: string
  category: string
  description?: string
  icon?: string
  is_active: boolean
}

export interface PropertyCreate {
  title: string
  description: string
  property_type: 'house' | 'apartment' | 'builder_floor' | 'room'
  purpose: 'buy' | 'rent' | 'short_stay'
  base_price: number
  latitude: number
  longitude: number
  city: string
  locality: string
  pincode: string
  area_sqft: number
  bedrooms: number
  bathrooms: number
  balconies?: number
  parking_spaces?: number
  floor_number?: number
  total_floors?: number
  age_of_property?: number
  max_occupancy?: number
  minimum_stay_days?: number
  amenity_ids?: number[]
  features?: string[]
  main_image_url?: string
  owner_name?: string
  owner_contact?: string
}

export interface PropertyUpdate extends Partial<PropertyCreate> {
  status?: 'available' | 'rented' | 'sold' | 'maintenance'
}

export interface PropertySearchParams {
  lat?: number
  lng?: number
  radius?: number
  q?: string
  property_type?: string[]
  purpose?: string
  price_min?: number
  price_max?: number
  bedrooms_min?: number
  bedrooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  area_min?: number
  area_max?: number
  city?: string
  locality?: string
  pincode?: string
  amenities?: number[]
  features?: string[]
  parking_spaces_min?: number
  floor_number_min?: number
  floor_number_max?: number
  age_max?: number
  check_in?: string
  check_out?: string
  guests?: number
  sort_by?: 'distance' | 'price_low' | 'price_high' | 'newest' | 'popular' | 'relevance'
  page?: number
  limit?: number
  exclude_swiped?: boolean
}

export interface UnifiedPropertyResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
  total_pages: number
  filters_applied: Record<string, any>
  search_center?: {
    latitude: number
    longitude: number
  }
}

// Visit Types
export interface Visit {
  id: number
  property_id: number
  user_id: number
  agent_id?: number
  scheduled_date: string
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
  special_requirements?: string
  notes?: string
  feedback?: string
  completed_at?: string
  created_at: string
  updated_at: string
  property?: Property
  user?: User
  agent?: Agent
}

export interface VisitCreate {
  property_id: number
  scheduled_date: string
  special_requirements?: string
}

export interface VisitUpdate {
  scheduled_date?: string
  special_requirements?: string
  notes?: string
  feedback?: string
}

export interface VisitList {
  visits: Visit[]
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface VisitsQuery {
  page?: number
  limit?: number
  status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
}

// Booking Types
export interface Booking {
  id: number
  property_id: number
  user_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  primary_guest_name: string
  primary_guest_phone: string
  primary_guest_email: string
  special_requests?: string
  guest_details?: Record<string, any>
  base_price: number
  total_nights: number
  subtotal: number
  taxes: number
  service_fee: number
  total_amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  payment_method?: string
  transaction_id?: string
  paid_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  review?: BookingReview
  created_at: string
  updated_at: string
  property?: Property
  user?: User
}

export interface BookingCreate {
  property_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  primary_guest_name: string
  primary_guest_phone: string
  primary_guest_email: string
  special_requests?: string
  guest_details?: Record<string, any>
}

export interface BookingUpdate {
  guests?: number
  primary_guest_name?: string
  primary_guest_phone?: string
  primary_guest_email?: string
  special_requests?: string
  guest_details?: Record<string, any>
}

export interface BookingAvailability {
  property_id: number
  check_in_date: string
  check_out_date: string
}

export interface AvailabilityInfo {
  is_available: boolean
  conflicting_bookings?: Booking[]
  available_dates?: string[]
  pricing_info?: BookingPricing
}

export interface BookingPricing {
  base_price: number
  total_nights: number
  subtotal: number
  taxes: number
  service_fee: number
  total_amount: number
  currency: string
  breakdown: PricingBreakdown[]
}

export interface PricingBreakdown {
  label: string
  amount: number
  type: 'base' | 'tax' | 'fee' | 'discount'
}

export interface BookingPayment {
  payment_method: string
  transaction_id: string
  amount: number
}

export interface BookingReview {
  rating: number
  review_text?: string
  aspects?: {
    cleanliness?: number
    location?: number
    value?: number
    communication?: number
    accuracy?: number
    checkin?: number
  }
}

export interface BookingList {
  bookings: Booking[]
  total: number
  upcoming: number
  past: number
  cancelled: number
}

export interface BookingsQuery {
  page?: number
  limit?: number
  status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
}

// Core System Types
export interface BugReport {
  id: number
  source: 'web' | 'mobile' | 'api'
  bug_type: 'ui_bug' | 'functional_bug' | 'performance_issue' | 'security_issue' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  device_info?: DeviceInfo
  app_version?: string
  tags?: string[]
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: number
  resolution_notes?: string
  created_by: number
  created_at: string
  updated_at: string
  resolved_at?: string
  user?: User
  attachments?: BugReportAttachment[]
}

export interface DeviceInfo {
  os?: string
  version?: string
  model?: string
  browser?: string
  screen_resolution?: string
}

export interface BugReportAttachment {
  id: number
  bug_report_id: number
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export interface BugReportCreate {
  source: 'web' | 'mobile' | 'api'
  bug_type: 'ui_bug' | 'functional_bug' | 'performance_issue' | 'security_issue' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  device_info?: DeviceInfo
  app_version?: string
  tags?: string[]
}

export interface BugReportUpdate {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: number
  resolution_notes?: string
}

export interface BugReportsQuery {
  status?: string
  bug_type?: string
  page?: number
  limit?: number
}

// Pages Types
export interface Page {
  unique_name: string
  title: string
  content: string
  format: 'html' | 'markdown'
  custom_config?: Record<string, any>
  is_active: boolean
  is_draft: boolean
  created_at: string
  updated_at: string
}

export interface PageCreate {
  unique_name: string
  title: string
  content: string
  format?: 'html' | 'markdown'
  custom_config?: Record<string, any>
  is_active?: boolean
  is_draft?: boolean
}

export interface PageUpdate {
  title?: string
  content?: string
  format?: 'html' | 'markdown'
  custom_config?: Record<string, any>
  is_active?: boolean
  is_draft?: boolean
}

export interface PagePublicResponse {
  unique_name: string
  title: string
  content: string
  format: 'html' | 'markdown'
  updated_at: string
}

export interface PagesQuery {
  is_active?: boolean
  is_draft?: boolean
  page?: number
  limit?: number
}

// App Updates Types
export interface AppUpdate {
  id: number
  platform: 'ios' | 'android' | 'web'
  version: string
  build_number: number
  release_notes: string
  download_url: string
  is_mandatory: boolean
  is_active: boolean
  min_supported_version: string
  created_at: string
  updated_at: string
}

export interface AppUpdateCreate {
  platform: 'ios' | 'android' | 'web'
  version: string
  build_number: number
  release_notes: string
  download_url: string
  is_mandatory?: boolean
  is_active?: boolean
  min_supported_version?: string
}

export interface AppUpdateUpdate {
  version?: string
  build_number?: number
  release_notes?: string
  download_url?: string
  is_mandatory?: boolean
  is_active?: boolean
  min_supported_version?: string
}

export interface AppUpdateCheckRequest {
  platform: 'ios' | 'android' | 'web'
  current_version: string
  build_number: number
}

export interface AppUpdateCheckResponse {
  update_available: boolean
  is_mandatory: boolean
  latest_version: string
  download_url: string
  release_notes: string
  min_supported_version: string
}

export interface AppUpdatesQuery {
  platform?: string
  is_active?: boolean
  page?: number
  limit?: number
}

// Health Check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
  details?: Record<string, any>
}

// Upload Types
export interface UploadResponse {
  file_path: string
  public_url: string
  filename: string
  content_type: string
  size: number
}

// Notification Types
export interface Notification {
  id: number
  user_id: number
  type: 'visit_reminder' | 'booking_update' | 'payment_received' | 'property_available' | 'system_message'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
  expires_at?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  types: Record<string, boolean>
}

// API Query Types
export interface UsersQuery {
  page?: number
  limit?: number
  q?: string
  agent_id?: number
}

// Reviews Types
export interface PropertyReview {
  id: number
  property_id: number
  user_id: number
  booking_id?: number
  rating: number
  title: string
  comment: string
  aspects?: {
    cleanliness?: number
    accuracy?: number
    communication?: number
    location?: number
    check_in?: number
    value?: number
  }
  tags?: string[]
  is_verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  user: {
    id: number
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface ReviewReply {
  id: number
  review_id: number
  user_id: number
  comment: string
  created_at: string
  updated_at: string
  user: {
    id: number
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  aspect_averages?: {
    cleanliness?: number
    accuracy?: number
    communication?: number
    location?: number
    check_in?: number
    value?: number
  }
}