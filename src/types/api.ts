// Core Types
export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
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
  [key: string]: unknown
  property_type?: string[]
  purpose?: 'buy' | 'rent' | 'short_stay'
  budget_min?: number
  budget_max?: number
  bedrooms_min?: number
  bedrooms_max?: number
  area_min?: number
  area_max?: number
  location_preference?: string[]
  max_distance_km?: number
}

export interface UserNotificationSettings {
  email_notifications?: boolean
  push_notifications?: boolean
  sms_notifications?: boolean
  visit_reminders?: boolean
  booking_updates?: boolean
  price_alerts?: boolean
  new_properties?: boolean
  property_updates?: boolean
  promotional_emails?: boolean
  onboarding?: boolean
  digest?: boolean
  frequency?: string
  quietHours?: {
    start: string
    end: string
  }
  quiet_hours?: {
    start: string
    end: string
  }
  categories?: Record<string, boolean>
}

export interface UserPrivacySettings {
  profile_visibility: 'public' | 'agents_only' | 'private'
  show_phone: boolean
  show_email: boolean
  allow_location_tracking: boolean
  data_sharing_consent: boolean
  location_sharing?: boolean
  contact_sharing?: boolean
  search_history_tracking?: boolean
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
  contact_number?: string
  description?: string
  avatar_url?: string
  languages?: string[]
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level: 'beginner' | 'intermediate' | 'expert'
  working_hours?: Record<string, unknown>
  total_users_assigned: number
  user_satisfaction_rating: number
  is_active: boolean
  is_available: boolean
  created_at: string
  updated_at?: string
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
  total_users_assigned: number
  user_satisfaction_rating: number
  active_conversations: number
  daily_interactions: number
  weekly_interactions: number
  efficiency_score: number
}

export interface AgentCreate {
  name: string
  contact_number?: string
  description?: string
  avatar_url?: string
  languages?: string[]
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level?: 'beginner' | 'intermediate' | 'expert'
  working_hours?: Record<string, unknown>
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
  total_users_served: number
  system_satisfaction_score: number
  agents_by_type: Record<string, number>
  load_distribution: AgentWorkload[]
}

export interface AgentWithStats extends Agent {
  stats: AgentPerformanceMetrics
}

// Property Types
export interface Property {
  id: number
  title: string
  description?: string
  property_type: 'house' | 'apartment' | 'builder_floor' | 'room'
  purpose: 'buy' | 'rent' | 'short_stay'
  base_price: number
  latitude?: number
  longitude?: number
  city?: string
  locality?: string
  pincode?: string
  area_sqft?: number
  bedrooms?: number
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
  status: 'available' | 'rented' | 'sold' | 'under_offer' | 'maintenance'
  liked?: boolean
  user_has_scheduled_visit?: boolean
  user_scheduled_visit_count?: number
  user_next_visit_date?: string
  distance_km?: number
  created_at: string
  updated_at?: string
}

export interface PropertyImage {
  id: number
  property_id: number
  image_url: string
  caption?: string
  image_category: string
  display_order?: number
  is_main_image: boolean
}

export interface Amenity {
  id: number
  title: string
  name?: string
  category?: string
  icon?: string
  is_active?: boolean
}

export interface PropertyCreate {
  title: string
  description?: string
  property_type: string
  purpose: string
  base_price: number
  latitude?: number
  longitude?: number
  city: string
  locality: string
  pincode?: string
  area_sqft?: number
  bedrooms?: number
  bathrooms?: number
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
  monthly_rent?: number
}

export interface PropertyUpdate extends Partial<PropertyCreate> {
  status?: 'available' | 'rented' | 'sold' | 'under_offer' | 'maintenance'
  is_available?: boolean
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
  semantic_search?: boolean
}

export interface UnifiedPropertyResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
  total_pages: number
  filters_applied: Record<string, unknown>
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
  status: 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
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
  q?: string
}

// Booking Types
export interface Booking {
  id: number
  property_id: number
  user_id: number
  booking_reference: string
  check_in_date: string
  check_out_date: string
  guests: number
  primary_guest_name: string
  primary_guest_phone: string
  primary_guest_email: string
  special_requests?: string
  guest_details?: Record<string, unknown>
  nights: number
  base_amount: number
  taxes_amount: number
  service_charges: number
  discount_amount: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  cancellation_date?: string
  cancellation_reason?: string
  guest_rating?: number
  guest_review?: string
  host_rating?: number
  host_review?: string
  review?: BookingReview
  created_at: string
  updated_at?: string
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
  guest_details?: Record<string, unknown>
}

export interface BookingUpdate {
  guests?: number
  primary_guest_name?: string
  primary_guest_phone?: string
  primary_guest_email?: string
  special_requests?: string
  guest_details?: Record<string, unknown>
}

export interface BookingAvailability {
  property_id: number
  check_in_date: string
  check_out_date: string
  guests: number
}

export interface AvailabilityInfo {
  available: boolean
  reason?: string
  max_occupancy?: number
}

export interface BookingPricing {
  property_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  nights: number
  base_amount: number
  taxes_amount: number
  service_charges: number
  discount_amount: number
  total_amount: number
  breakdown?: Record<string, number>
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
  guest_rating: number
  guest_review?: string
}

export interface BookingList {
  bookings: Booking[]
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface BookingsQuery {
  page?: number
  limit?: number
  status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
  q?: string
  payment_status?: string
}

// Core System Types
export interface BugReport {
  id: number
  user_id?: number | null
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
  media_urls?: string[]
  tags?: string[]
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: number
  resolution?: string
  created_at: string
  updated_at?: string
  resolved_at?: string
}

export interface DeviceInfo {
  os?: string
  version?: string
  model?: string
  browser?: string
  screen_resolution?: string
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
  assigned_to?: number
  resolution?: string
  tags?: string[]
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
  format: 'html' | 'markdown'
  custom_config?: Record<string, unknown>
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
  custom_config?: Record<string, unknown>
  is_active?: boolean
  is_draft?: boolean
}

export interface PageUpdate {
  title?: string
  content?: string
  format?: 'html' | 'markdown'
  custom_config?: Record<string, unknown>
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
  app?: string
  platform?: string
  is_active?: boolean
  limit?: number
  offset?: number
}

// Health Check
export interface HealthResponse {
  status: 'healthy' | 'degraded'
  database: string
  database_url?: string
  timestamp: string
  version: string
}

// App Configuration (non-sensitive)
export interface AppConfig {
  api_version: string
  environment: string
  database: string
  auth: string
  features: string[]
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
  data?: Record<string, unknown>
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
