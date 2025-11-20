// Core Types
export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Simple message/ack response from backend
export interface MessageResponse {
  message: string
  success?: boolean
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
  email: string | null
  full_name: string | null
  phone?: string | null
  role: 'user' | 'agent' | 'admin'
  is_active: boolean
  is_verified: boolean
  supabase_user_id: string
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
  property_type?: string[]
  purpose?: PropertyPurpose | null
  budget_min?: number | null
  budget_max?: number | null
  bedrooms_min?: number | null
  bedrooms_max?: number | null
  area_min?: number | null
  area_max?: number | null
  location_preference?: string[] | null
  max_distance_km?: number
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
  name: string
  contact_number?: string | null
  description?: string | null
  avatar_url?: string | null
  languages?: string[] | null
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level: 'beginner' | 'intermediate' | 'expert'
  working_hours?: Record<string, any> | null
  is_active?: boolean
  is_available: boolean
  total_users_assigned?: number
  user_satisfaction_rating?: number
  performance_metrics?: AgentPerformanceMetrics
  created_at: string
  updated_at?: string | null
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
  name: string
  contact_number?: string | null
  description?: string | null
  avatar_url?: string | null
  languages?: string[]
  agent_type?: 'general' | 'specialist' | 'senior'
  experience_level?: 'beginner' | 'intermediate' | 'expert'
  working_hours?: Record<string, any> | null
}

export interface AgentWorkload {
  agent_id: number
  agent_name: string
  current_users: number
  utilization_percentage: number
  is_available: boolean
  queue_length: number
}

export interface AgentSystemStats {
  total_agents: number
  active_agents: number
  active_users?: number
  total_users_served: number
  system_satisfaction_score: number
  properties_listed?: number
  occupancy_rate?: number
  agents_by_type: Record<string, number>
  load_distribution: AgentWorkload[]
}

// Property Types
export type PropertyType = 'house' | 'apartment' | 'builder_floor' | 'room'
export type PropertyPurpose = 'buy' | 'rent' | 'short_stay'
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'under_offer' | 'maintenance'

export interface Property {
  id: number
  title: string
  description?: string | null
  property_type: PropertyType
  purpose: PropertyPurpose
  base_price: number
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  state?: string | null
  country: string
  pincode?: string | null
  locality?: string | null
  sub_locality?: string | null
  landmark?: string | null
  full_address?: string | null
  area_type?: string | null
  area_sqft?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  parking_spaces?: number | null
  floor_number?: number | null
  total_floors?: number | null
  age_of_property?: number | null
  max_occupancy?: number | null
  minimum_stay_days?: number | null
  price_per_sqft?: number | null
  monthly_rent?: number | null
  daily_rate?: number | null
  security_deposit?: number | null
  maintenance_charges?: number | null
  features?: string[] | null
  amenities?: PropertyAmenityResponse[] | null
  images?: PropertyImage[] | null
  main_image_url?: string | null
  virtual_tour_url?: string | null
  owner_id: number
  owner_name?: string | null
  owner_contact?: string | null
  builder_name?: string | null
  status: PropertyStatus
  is_available: boolean
  available_from?: string | null
  calendar_data?: Record<string, any> | null
  tags?: string[] | null
  liked?: boolean | null
  user_has_scheduled_visit?: boolean | null
  user_scheduled_visit_count?: number | null
  user_next_visit_date?: string | null
  distance_km?: number | null
  view_count: number
  like_count: number
  interest_count: number
  created_at: string
  updated_at?: string | null
  // Legacy shape retained for backward compatibility
  location?: {
    latitude?: number
    longitude?: number
  }
}

export interface PropertyImage {
  image_url: string
  caption?: string | null
  display_order?: number
  is_main_image?: boolean
  id: number
  property_id: number
  // Legacy aliases
  url?: string
  is_main?: boolean
  order?: number
}

export interface Amenity {
  id: number
  title: string
  icon?: string | null
  category?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string | null
  // Legacy alias
  name?: string
}

export interface PropertyAmenityResponse {
  id: number
  title: string
  icon?: string | null
  category?: string | null
}

export interface PropertyCreate {
  title: string
  description?: string | null
  property_type: PropertyType
  purpose: PropertyPurpose
  base_price: number
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  state?: string | null
  country?: string
  locality?: string | null
  pincode?: string | null
  area_sqft?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  parking_spaces?: number | null
  floor_number?: number | null
  total_floors?: number | null
  age_of_property?: number | null
  max_occupancy?: number | null
  minimum_stay_days?: number | null
  amenity_ids?: number[] | null
  features?: string[] | null
  main_image_url?: string | null
  virtual_tour_url?: string | null
  available_from?: string | null
  calendar_data?: Record<string, any> | null
  tags?: string[] | null
  owner_name?: string | null
  owner_contact?: string | null
  builder_name?: string | null
}

export interface PropertyUpdate extends Partial<PropertyCreate> {
  status?: PropertyStatus
  is_available?: boolean
}

export interface PropertySearchParams {
  lat?: number
  lng?: number
  radius?: number
  q?: string
  property_type?: PropertyType[]
  purpose?: PropertyPurpose | null
  status?: PropertyStatus | string
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
  amenities?: string[]
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

export interface SwipeHistoryResponse {
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
  agent_id?: number | null
  scheduled_date: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  special_requirements?: string | null
  visit_notes?: string | null
  visitor_feedback?: string | null
  interest_level?: string | null
  follow_up_required?: boolean
  follow_up_date?: string | null
  actual_date?: string | null
  cancellation_reason?: string | null
  rescheduled_from?: string | null
  created_at: string
  updated_at?: string | null
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
  scheduled_date?: string | null
  special_requirements?: string | null
  visit_notes?: string | null
  visitor_feedback?: string | null
  interest_level?: string | null
  follow_up_required?: boolean | null
  follow_up_date?: string | null
  cancellation_reason?: string | null
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
  base_amount: number
  taxes_amount: number
  service_charges: number
  discount_amount: number
  total_amount: number
  booking_reference: string
  nights: number
  booking_status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
  // Legacy alias for UI components
  status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed'
  internal_notes?: string | null
  actual_check_in?: string | null
  actual_check_out?: string | null
  early_check_in?: boolean
  late_check_out?: boolean
  cancellation_date?: string | null
  cancellation_reason?: string | null
  refund_amount?: number | null
  payment_method?: string | null
  transaction_id?: string | null
  payment_date?: string | null
  guest_rating?: number | null
  guest_review?: string | null
  host_rating?: number | null
  host_review?: string | null
  created_at: string
  updated_at?: string | null
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
  check_in_date?: string | null
  check_out_date?: string | null
  guests?: number
  primary_guest_name?: string | null
  primary_guest_phone?: string | null
  primary_guest_email?: string | null
  special_requests?: string | null
  guest_details?: Record<string, any>
}

export interface BookingAvailability {
  property_id: number
  check_in_date: string
  check_out_date: string
  guests?: number
}

export interface AvailabilityInfo {
  is_available: boolean
  conflicting_bookings?: Booking[]
  available_dates?: string[]
  pricing_info?: BookingPricing
}

export interface BookingPricing {
  base_price: number
  total_nights?: number
  subtotal?: number
  taxes?: number
  service_fee?: number
  total_amount: number
  currency?: string
  breakdown?: PricingBreakdown[]
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
  booking_id?: number
  guest_rating: number
  guest_review?: string | null
  // Legacy alias used by UI forms
  rating?: number
  review_text?: string | null
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
  payment_status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
  q?: string
}

// Core System Types
export interface BugReport {
  id: number
  source: 'web' | 'mobile' | 'api'
  bug_type: 'ui_bug' | 'functionality_bug' | 'performance_issue' | 'crash' | 'feature_request' | 'other'
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
  bug_type: 'ui_bug' | 'functionality_bug' | 'performance_issue' | 'crash' | 'feature_request' | 'other'
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
  limit?: number
  offset?: number
}

// Pages Types
export interface Page {
  unique_name: string
  title: string
  content: string
  format: 'html' | 'markdown' | 'json'
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
  format?: 'html' | 'markdown' | 'json'
  custom_config?: Record<string, any>
  is_active?: boolean
  is_draft?: boolean
}

export interface PageUpdate {
  title?: string
  content?: string
  format?: 'html' | 'markdown' | 'json'
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
  limit?: number
  offset?: number
}

// App Updates Types
export interface AppUpdate {
  id: number
  app?: string
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
  app?: string
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
  app?: string
  version?: string
  build_number?: number
  release_notes?: string
  download_url?: string
  is_mandatory?: boolean
  is_active?: boolean
  min_supported_version?: string
}

export interface AppUpdateCheckRequest {
  app?: string
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
  limit?: number
  offset?: number
}

// Health Check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
  details?: Record<string, any>
}

// App Configuration (non-sensitive)
export interface AppConfig {
  app_name?: string
  environment?: string
  features?: Record<string, boolean>
  ui?: Record<string, any>
  [key: string]: any
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

// FAQ Types
export interface FAQResponse {
  id: number
  question: string
  answer: string
  category?: string | null
  tags?: string[] | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

export interface FAQCreate {
  question: string
  answer: string
  category?: string | null
  tags?: string[] | null
  display_order?: number
  is_active?: boolean
}

export interface FAQUpdate {
  question?: string | null
  answer?: string | null
  category?: string | null
  tags?: string[] | null
  display_order?: number | null
  is_active?: boolean | null
}

export interface FAQQuery {
  category?: string | null
  is_active?: boolean | null
  limit?: number
  offset?: number
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
