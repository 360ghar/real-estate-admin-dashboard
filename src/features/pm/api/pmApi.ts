import { api } from '@/store/api'

export type ManagedPropertyStatus = 'draft' | 'active' | 'archived'

export type TenantStatus = 'applicant' | 'approved' | 'active' | 'notice_period' | 'vacated' | 'rejected'

export type LeaseStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'terminated'
  | 'renewed'

export type RentChargeStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'waived'

export type ExpenseCategory =
  | 'maintenance'
  | 'repairs'
  | 'insurance'
  | 'property_tax'
  | 'hoa'
  | 'utilities'
  | 'marketing'
  | 'legal'
  | 'other'

export type MaintenanceUrgency = 'emergency' | 'high' | 'medium' | 'low'

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'structural'
  | 'pest_control'
  | 'cleaning'
  | 'other'

export type MaintenanceRequestStatus = 'open' | 'in_review' | 'work_order_created' | 'resolved' | 'closed'

export type WorkOrderStatus = 'created' | 'assigned' | 'in_progress' | 'completed' | 'closed' | 'cancelled'

export type DocumentType =
  | 'lease_agreement'
  | 'id_proof'
  | 'address_proof'
  | 'income_proof'
  | 'inspection_report'
  | 'receipt'
  | 'invoice'
  | 'property_deed'
  | 'insurance_policy'
  | 'other'

export type InspectionType = 'move_in' | 'move_out' | 'routine'

export interface DashboardOverview {
  total_properties: number
  occupied_properties: number
  vacant_properties: number
  under_maintenance_properties: number
  monthly_revenue_current: number
  monthly_revenue_previous: number
  outstanding_rent_total: number
  upcoming_expenses_total: number
}

export interface ActivityItem {
  type: string
  at: string
  id?: number | null
  property_id?: number | null
  lease_id?: number | null
  amount?: number | null
  status?: string | null
}

export type PropertyPurpose = 'buy' | 'rent' | 'short_stay'
export type PropertyType = 'house' | 'apartment' | 'builder_floor' | 'room'
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'under_offer' | 'maintenance'

export interface PmPropertyImage {
  id: number
  property_id: number
  image_url: string
  caption?: string | null
  image_category?: string | null
  display_order?: number | null
  is_main_image?: boolean | null
}

export interface PmPropertyAmenity {
  id: number
  amenity_id: number
  title?: string | null
  icon?: string | null
  category?: string | null
  is_active?: boolean | null
}

export interface PmProperty {
  id: number
  title: string
  description?: string | null
  property_type: PropertyType
  purpose: PropertyPurpose
  status: PropertyStatus

  latitude?: number | null
  longitude?: number | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
  locality?: string | null
  sub_locality?: string | null
  landmark?: string | null
  full_address?: string | null

  base_price: number
  monthly_rent?: number | null
  security_deposit?: number | null
  maintenance_charges?: number | null

  area_sqft?: number | null
  bedrooms?: number | null
  bathrooms?: number | null

  owner_id: number
  owner_name?: string | null
  owner_contact?: string | null

  is_managed: boolean
  management_status?: ManagedPropertyStatus | null
  payment_due_day?: number | null
  grace_period_days?: number | null
  late_fee_policy?: Record<string, unknown> | null
  current_lease_id?: number | null
  current_tenant_id?: number | null

  images?: PmPropertyImage[] | null
  amenities?: PmPropertyAmenity[] | null

  created_at: string
  updated_at?: string | null
}

export interface PropertyCreate {
  title: string
  description?: string
  property_type: PropertyType
  purpose: PropertyPurpose
  base_price: number
  latitude?: number
  longitude?: number
  city?: string
  state?: string
  country?: string
  pincode?: string
  locality?: string
  sub_locality?: string
  landmark?: string
  full_address?: string
  area_type?: string
  area_sqft?: number
  bedrooms?: number
  bathrooms?: number
  balconies?: number
  parking_spaces?: number
  video_urls?: string[]
  google_street_view_url?: string
  floor_plan_url?: string
  video_tour_url?: string
  price_per_sqft?: number
  monthly_rent?: number
  daily_rate?: number
  security_deposit?: number
  maintenance_charges?: number
  floor_number?: number
  total_floors?: number
  age_of_property?: number
  max_occupancy?: number
  minimum_stay_days?: number
  amenity_ids?: number[]
  features?: string[]
  main_image_url?: string
  virtual_tour_url?: string
  available_from?: string
  calendar_data?: Record<string, unknown>
  tags?: string[]
  owner_name?: string
  owner_contact?: string
  builder_name?: string
  search_keywords?: string
}

export interface ManagedPropertyUpdate {
  management_status?: ManagedPropertyStatus | null
  payment_due_day?: number | null
  grace_period_days?: number | null
  late_fee_policy?: Record<string, unknown> | null
}

export interface Lease {
  id: number
  property_id: number
  owner_id: number
  tenant_user_id?: number | null
  tenant_name?: string | null
  tenant_phone?: string | null
  tenant_email?: string | null
  status: LeaseStatus
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  late_fee_amount?: number | null
  late_fee_percentage?: number | null
  grace_period_days: number
  payment_due_day: number
  lease_terms?: Record<string, unknown> | null
  special_clauses?: string | null
  signed_by_tenant_at?: string | null
  signed_by_owner_at?: string | null
  lease_document_id?: number | null
  created_at: string
  updated_at?: string | null
}

export interface LeaseCreate {
  owner_id?: number | null
  property_id: number
  tenant_user_id?: number | null
  tenant_name?: string | null
  tenant_phone?: string | null
  tenant_email?: string | null
  status?: LeaseStatus
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  late_fee_amount?: number | null
  late_fee_percentage?: number | null
  grace_period_days?: number
  payment_due_day?: number
  lease_terms?: Record<string, unknown> | null
  special_clauses?: string | null
  lease_document_id?: number | null
}

export interface LeaseUploadSigned {
  lease_document_id: number
  signed_by_owner?: boolean
  signed_by_tenant?: boolean
}

export interface LeaseRenew {
  start_date: string
  end_date: string
  monthly_rent?: number | null
  security_deposit?: number | null
  make_active?: boolean
}

export interface RentCharge {
  id: number
  lease_id: number
  property_id: number
  owner_id: number
  tenant_user_id?: number | null
  billing_month: string
  period_start: string
  period_end: string
  due_date: string
  amount_due: number
  late_fee_assessed: number
  status: RentChargeStatus
  created_at: string
  updated_at?: string | null
}

export interface RentChargeWithTotals {
  charge: RentCharge
  amount_paid_total: number
  amount_due_total: number
  outstanding: number
}

export interface RentChargeGenerateRequest {
  owner_id?: number | null
  lease_id?: number | null
  start_month?: string | null
  months?: number
}

export interface RentPayment {
  id: number
  charge_id: number
  lease_id: number
  property_id: number
  owner_id: number
  tenant_user_id?: number | null
  paid_at: string
  amount_paid: number
  payment_method?: string | null
  reference?: string | null
  notes?: string | null
  receipt_document_id?: number | null
  created_at: string
  updated_at?: string | null
}

export interface RentPaymentCreate {
  charge_id: number
  amount_paid: number
  paid_at?: string | null
  payment_method?: string | null
  reference?: string | null
  notes?: string | null
  receipt_document_id?: number | null
}

export interface Expense {
  id: number
  property_id: number
  owner_id: number
  category: ExpenseCategory
  amount: number
  expense_date: string
  description?: string | null
  notes?: string | null
  receipt_document_id?: number | null
  is_recurring: boolean
  recurrence_rule?: Record<string, unknown> | null
  next_due_date?: string | null
  created_at: string
  updated_at?: string | null
}

export interface ExpenseCreate {
  owner_id?: number | null
  property_id: number
  category: ExpenseCategory
  amount: number
  expense_date: string
  description?: string | null
  notes?: string | null
  receipt_document_id?: number | null
  is_recurring?: boolean
  recurrence_rule?: Record<string, unknown> | null
  next_due_date?: string | null
}

export interface ExpenseUpdate {
  property_id?: number | null
  category?: ExpenseCategory | null
  amount?: number | null
  expense_date?: string | null
  description?: string | null
  notes?: string | null
  receipt_document_id?: number | null
  is_recurring?: boolean | null
  recurrence_rule?: Record<string, unknown> | null
  next_due_date?: string | null
}

export interface MaintenanceRequest {
  id: number
  property_id: number
  lease_id?: number | null
  owner_id: number
  tenant_user_id?: number | null
  category: MaintenanceCategory
  urgency: MaintenanceUrgency
  title: string
  description?: string | null
  preferred_contact_method?: string | null
  availability_notes?: string | null
  request_status: MaintenanceRequestStatus
  assigned_agent_id?: number | null
  work_order_status?: WorkOrderStatus | null
  priority?: string | null
  estimated_cost?: number | null
  actual_cost?: number | null
  scheduled_for?: string | null
  completed_at?: string | null
  closed_at?: string | null
  completion_notes?: string | null
  created_at: string
  updated_at?: string | null
}

export interface MaintenanceRequestCreate {
  property_id: number
  category: MaintenanceCategory
  urgency: MaintenanceUrgency
  title: string
  description?: string | null
  preferred_contact_method?: string | null
  availability_notes?: string | null
}

export interface MaintenanceRequestUpdate {
  request_status?: MaintenanceRequestStatus | null
  assigned_agent_id?: number | null
  work_order_status?: WorkOrderStatus | null
  priority?: string | null
  estimated_cost?: number | null
  actual_cost?: number | null
  scheduled_for?: string | null
  completed_at?: string | null
  closed_at?: string | null
  completion_notes?: string | null
}

export interface Document {
  id: number
  owner_id: number
  user_id?: number | null
  property_id?: number | null
  lease_id?: number | null
  maintenance_request_id?: number | null
  rental_application_id?: number | null
  document_type: DocumentType
  title: string
  file_url: string
  file_path?: string | null
  mime_type?: string | null
  file_size?: number | null
  shared_with_tenant: boolean
  shared_with_agent: boolean
  version: number
  replaces_document_id?: number | null
  created_by_user_id?: number | null
  created_at: string
  updated_at?: string | null
}

export interface DocumentUpdate {
  title?: string | null
  shared_with_tenant?: boolean | null
  shared_with_agent?: boolean | null
}

export interface DocumentDownload {
  url: string
}

export interface InspectionChecklist {
  id: number
  property_id: number
  lease_id: number
  owner_id: number
  inspection_type: InspectionType
  conducted_by_user_id: number
  conducted_at: string
  rooms_data?: Record<string, unknown> | null
  overall_notes?: string | null
  tenant_signature_document_id?: number | null
  owner_signature_document_id?: number | null
  signed_by_tenant_at?: string | null
  signed_by_owner_at?: string | null
  created_at: string
  updated_at?: string | null
}

export interface InspectionChecklistCreate {
  owner_id?: number | null
  lease_id: number
  inspection_type: InspectionType
  rooms_data?: Record<string, unknown> | null
  overall_notes?: string | null
  conducted_at?: string | null
}

export interface InspectionSign {
  tenant_signature_document_id?: number | null
  owner_signature_document_id?: number | null
}

export interface RentRollItem {
  property_id: number
  title: string
  occupancy: string
  tenant_user_id?: number | null
  monthly_rent?: number | null
  lease_end_date?: string | null
}

export interface IncomeReport {
  total_income: number
  start?: string | null
  end?: string | null
}

export interface ExpenseReport {
  total_expenses: number
  start?: string | null
  end?: string | null
}

export interface PnLReport {
  total_income: number
  total_expenses: number
  net_income: number
  start?: string | null
  end?: string | null
}

export interface OccupancyReport {
  total: number
  occupied: number
  vacant: number
}

export interface MaintenanceReport {
  total_requests: number
}

export interface TenantSummary {
  user_id: number
  full_name?: string | null
  phone?: string | null
  email?: string | null
  active_leases_count: number
}

export interface TenantDetail {
  user_id: number
  full_name?: string | null
  phone?: string | null
  email?: string | null
  leases: Lease[]
}

export interface OwnerRMAssignmentCreate {
  owner_user_id?: number | null
  agent_id?: number | null
}

export interface OwnerRMAssignmentUpdate {
  agent_id?: number | null
}

export interface OwnerRMAssignmentResponse {
  owner_user_id: number
  agent_id?: number | null
  agent?: Record<string, unknown> | null
}

export interface RentalApplicationForm {
  id: number
  owner_id: number
  property_id?: number | null
  title: string
  description?: string | null
  slug: string
  is_active: boolean
  application_fee_amount?: number | null
  required_document_types?: Record<string, unknown> | null
  questions?: Record<string, unknown> | null
  config?: Record<string, unknown> | null
  created_at: string
  updated_at?: string | null
}

export interface RentalApplicationFormCreate {
  owner_id?: number | null
  property_id?: number | null
  title: string
  description?: string | null
  application_fee_amount?: number | null
  required_document_types?: Record<string, unknown> | null
  questions?: Record<string, unknown> | null
  config?: Record<string, unknown> | null
}

export interface RentalApplicationDecision {
  decision: TenantStatus
}

export interface RentalApplication {
  id: number
  form_id: number
  property_id: number
  owner_id: number
  status: TenantStatus
  applicant_user_id?: number | null
  applicant_full_name?: string | null
  applicant_phone?: string | null
  applicant_email?: string | null
  answers?: Record<string, unknown> | null
  application_data?: Record<string, unknown> | null
  emergency_contacts?: Record<string, unknown> | null
  submitted_at?: string | null
  decision_at?: string | null
  decided_by_user_id?: number | null
  created_at: string
  updated_at?: string | null
}

export interface ManagedPropertyDetail {
  property: PmProperty
  active_lease?: Lease | null
}

export const pmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPmDashboardOverview: builder.query<DashboardOverview, { owner_id?: number | null }>({
      query: ({ owner_id }) => ({
        url: '/pm/dashboard/overview',
        params: owner_id ? { owner_id } : undefined,
      }),
      providesTags: ['PmDashboard'],
    }),

    getPmDashboardActivity: builder.query<ActivityItem[], { owner_id?: number | null; limit?: number }>({
      query: ({ owner_id, limit }) => ({
        url: '/pm/dashboard/activity',
        params: { owner_id: owner_id || undefined, limit: limit ?? 20 },
      }),
      providesTags: ['PmDashboard'],
    }),

    listPmProperties: builder.query<
      PmProperty[],
      { owner_id?: number | null; occupancy?: 'occupied' | 'vacant'; q?: string; limit?: number; offset?: number }
    >({
      query: ({ owner_id, occupancy, q, limit = 50, offset = 0 }) => ({
        url: '/pm/properties/',
        params: {
          owner_id: owner_id || undefined,
          occupancy,
          q,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [...res.map((p) => ({ type: 'PmProperty' as const, id: p.id })), { type: 'PmProperty' as const, id: 'LIST' }]
          : [{ type: 'PmProperty' as const, id: 'LIST' }],
    }),

    createPmProperty: builder.mutation<
      PmProperty,
      {
        data: PropertyCreate
        owner_id?: number | null
        management_status?: ManagedPropertyStatus
        payment_due_day?: number
        grace_period_days?: number
      }
    >({
      query: ({ data, owner_id, management_status, payment_due_day, grace_period_days }) => ({
        url: '/pm/properties/',
        method: 'POST',
        params: {
          owner_id: owner_id || undefined,
          management_status: management_status ?? 'active',
          payment_due_day: payment_due_day ?? 1,
          grace_period_days: grace_period_days ?? 5,
        },
        body: data,
      }),
      invalidatesTags: [{ type: 'PmProperty', id: 'LIST' }, 'PmDashboard'],
    }),

    getPmPropertyDetail: builder.query<ManagedPropertyDetail, number>({
      query: (property_id) => `/pm/properties/${property_id}`,
      providesTags: (_res, _e, property_id) => [{ type: 'PmProperty', id: property_id }],
    }),

    updatePmProperty: builder.mutation<PmProperty, { property_id: number; payload: ManagedPropertyUpdate }>({
      query: ({ property_id, payload }) => ({
        url: `/pm/properties/${property_id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { property_id }) => [{ type: 'PmProperty', id: property_id }, { type: 'PmProperty', id: 'LIST' }, 'PmDashboard'],
    }),

    listPmLeases: builder.query<
      Lease[],
      { owner_id?: number | null; property_id?: number; tenant_user_id?: number; status?: LeaseStatus; limit?: number; offset?: number }
    >({
      query: ({ owner_id, property_id, tenant_user_id, status, limit = 50, offset = 0 }) => ({
        url: '/pm/leases/',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          tenant_user_id,
          status,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [...res.map((l) => ({ type: 'PmLease' as const, id: l.id })), { type: 'PmLease' as const, id: 'LIST' }]
          : [{ type: 'PmLease' as const, id: 'LIST' }],
    }),

    getPmLease: builder.query<Lease, number>({
      query: (lease_id) => `/pm/leases/${lease_id}`,
      providesTags: (_res, _e, lease_id) => [{ type: 'PmLease', id: lease_id }],
    }),

    createPmLease: builder.mutation<Lease, LeaseCreate>({
      query: (payload) => ({
        url: '/pm/leases/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmLease', id: 'LIST' }, { type: 'PmProperty', id: 'LIST' }, 'PmDashboard'],
    }),

    uploadSignedPmLease: builder.mutation<Lease, { lease_id: number; payload: LeaseUploadSigned }>({
      query: ({ lease_id, payload }) => ({
        url: `/pm/leases/${lease_id}/upload-signed`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { lease_id }) => [{ type: 'PmLease', id: lease_id }, { type: 'PmLease', id: 'LIST' }],
    }),

    renewPmLease: builder.mutation<Lease, { lease_id: number; payload: LeaseRenew }>({
      query: ({ lease_id, payload }) => ({
        url: `/pm/leases/${lease_id}/renew`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { lease_id }) => [{ type: 'PmLease', id: lease_id }, { type: 'PmLease', id: 'LIST' }, { type: 'PmProperty', id: 'LIST' }, 'PmDashboard'],
    }),

    terminatePmLease: builder.mutation<Lease, number>({
      query: (lease_id) => ({
        url: `/pm/leases/${lease_id}/terminate`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _e, lease_id) => [{ type: 'PmLease', id: lease_id }, { type: 'PmLease', id: 'LIST' }, { type: 'PmProperty', id: 'LIST' }, 'PmDashboard'],
    }),

    generateRentCharges: builder.mutation<{ created: number; skipped: number }, RentChargeGenerateRequest>({
      query: (payload) => ({
        url: '/pm/rent/charges/generate',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmRentCharge', id: 'LIST' }, 'PmDashboard'],
    }),

    listRentCharges: builder.query<
      RentChargeWithTotals[],
      { owner_id?: number | null; lease_id?: number; property_id?: number; status?: RentChargeStatus; limit?: number; offset?: number; as_tenant?: boolean }
    >({
      query: ({ owner_id, lease_id, property_id, status, limit = 50, offset = 0, as_tenant = false }) => ({
        url: '/pm/rent/charges',
        params: {
          as_tenant,
          owner_id: owner_id || undefined,
          lease_id,
          property_id,
          status,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((c) => ({ type: 'PmRentCharge' as const, id: c.charge.id })),
              { type: 'PmRentCharge' as const, id: 'LIST' },
            ]
          : [{ type: 'PmRentCharge' as const, id: 'LIST' }],
    }),

    recordRentPayment: builder.mutation<RentPayment, RentPaymentCreate>({
      query: (payload) => ({
        url: '/pm/rent/payments',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmRentPayment', id: 'LIST' }, { type: 'PmRentCharge', id: 'LIST' }, 'PmDashboard'],
    }),

    listRentPayments: builder.query<
      RentPayment[],
      { owner_id?: number | null; lease_id?: number; property_id?: number; limit?: number; offset?: number; as_tenant?: boolean }
    >({
      query: ({ owner_id, lease_id, property_id, limit = 50, offset = 0, as_tenant = false }) => ({
        url: '/pm/rent/payments',
        params: {
          as_tenant,
          owner_id: owner_id || undefined,
          lease_id,
          property_id,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((p) => ({ type: 'PmRentPayment' as const, id: p.id })),
              { type: 'PmRentPayment' as const, id: 'LIST' },
            ]
          : [{ type: 'PmRentPayment' as const, id: 'LIST' }],
    }),

    createPmExpense: builder.mutation<Expense, ExpenseCreate>({
      query: (payload) => ({
        url: '/pm/expenses/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmExpense', id: 'LIST' }, 'PmDashboard'],
    }),

    listPmExpenses: builder.query<
      Expense[],
      { owner_id?: number | null; property_id?: number; category?: ExpenseCategory; start_date?: string; end_date?: string; limit?: number; offset?: number }
    >({
      query: ({ owner_id, property_id, category, start_date, end_date, limit = 50, offset = 0 }) => ({
        url: '/pm/expenses/',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          category,
          start_date,
          end_date,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [...res.map((e) => ({ type: 'PmExpense' as const, id: e.id })), { type: 'PmExpense' as const, id: 'LIST' }]
          : [{ type: 'PmExpense' as const, id: 'LIST' }],
    }),

    updatePmExpense: builder.mutation<Expense, { expense_id: number; payload: ExpenseUpdate }>({
      query: ({ expense_id, payload }) => ({
        url: `/pm/expenses/${expense_id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { expense_id }) => [{ type: 'PmExpense', id: expense_id }, { type: 'PmExpense', id: 'LIST' }, 'PmDashboard'],
    }),

    createMaintenanceRequest: builder.mutation<MaintenanceRequest, MaintenanceRequestCreate>({
      query: (payload) => ({
        url: '/pm/maintenance/requests',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmMaintenanceRequest', id: 'LIST' }, 'PmDashboard'],
    }),

    listMaintenanceRequests: builder.query<
      MaintenanceRequest[],
      {
        owner_id?: number | null
        property_id?: number
        lease_id?: number
        request_status?: MaintenanceRequestStatus
        work_order_status?: WorkOrderStatus
        limit?: number
        offset?: number
      }
    >({
      query: ({ owner_id, property_id, lease_id, request_status, work_order_status, limit = 50, offset = 0 }) => ({
        url: '/pm/maintenance/requests',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          lease_id,
          request_status,
          work_order_status,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((r) => ({ type: 'PmMaintenanceRequest' as const, id: r.id })),
              { type: 'PmMaintenanceRequest' as const, id: 'LIST' },
            ]
          : [{ type: 'PmMaintenanceRequest' as const, id: 'LIST' }],
    }),

    updateMaintenanceRequest: builder.mutation<
      MaintenanceRequest,
      { request_id: number; payload: MaintenanceRequestUpdate }
    >({
      query: ({ request_id, payload }) => ({
        url: `/pm/maintenance/requests/${request_id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { request_id }) => [{ type: 'PmMaintenanceRequest', id: request_id }, { type: 'PmMaintenanceRequest', id: 'LIST' }, 'PmDashboard'],
    }),

    uploadPmDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/pm/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'PmDocument', id: 'LIST' }, 'PmDashboard'],
    }),

    listPmDocuments: builder.query<
      Document[],
      {
        owner_id?: number | null
        property_id?: number
        lease_id?: number
        user_id?: number
        maintenance_request_id?: number
        rental_application_id?: number
        document_type?: DocumentType
        limit?: number
        offset?: number
      }
    >({
      query: ({ owner_id, property_id, lease_id, user_id, maintenance_request_id, rental_application_id, document_type, limit = 50, offset = 0 }) => ({
        url: '/pm/documents/',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          lease_id,
          user_id,
          maintenance_request_id,
          rental_application_id,
          document_type,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [...res.map((d) => ({ type: 'PmDocument' as const, id: d.id })), { type: 'PmDocument' as const, id: 'LIST' }]
          : [{ type: 'PmDocument' as const, id: 'LIST' }],
    }),

    updatePmDocument: builder.mutation<Document, { document_id: number; payload: DocumentUpdate }>({
      query: ({ document_id, payload }) => ({
        url: `/pm/documents/${document_id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { document_id }) => [{ type: 'PmDocument', id: document_id }, { type: 'PmDocument', id: 'LIST' }],
    }),

    getPmDocumentDownloadUrl: builder.query<DocumentDownload, number>({
      query: (document_id) => `/pm/documents/${document_id}/download`,
    }),

    createPmInspection: builder.mutation<InspectionChecklist, InspectionChecklistCreate>({
      query: (payload) => ({
        url: '/pm/inspections/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PmInspection', id: 'LIST' }],
    }),

    listPmInspections: builder.query<
      InspectionChecklist[],
      { owner_id?: number | null; lease_id?: number; property_id?: number; limit?: number; offset?: number }
    >({
      query: ({ owner_id, lease_id, property_id, limit = 50, offset = 0 }) => ({
        url: '/pm/inspections/',
        params: {
          owner_id: owner_id || undefined,
          lease_id,
          property_id,
          limit,
          offset,
        },
      }),
      providesTags: (res) =>
        res
          ? [...res.map((i) => ({ type: 'PmInspection' as const, id: i.id })), { type: 'PmInspection' as const, id: 'LIST' }]
          : [{ type: 'PmInspection' as const, id: 'LIST' }],
    }),

    getPmInspection: builder.query<InspectionChecklist, number>({
      query: (inspection_id) => `/pm/inspections/${inspection_id}`,
      providesTags: (_res, _e, inspection_id) => [{ type: 'PmInspection', id: inspection_id }],
    }),

    signPmInspection: builder.mutation<InspectionChecklist, { inspection_id: number; payload: InspectionSign }>({
      query: ({ inspection_id, payload }) => ({
        url: `/pm/inspections/${inspection_id}/sign`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { inspection_id }) => [{ type: 'PmInspection', id: inspection_id }, { type: 'PmInspection', id: 'LIST' }],
    }),

    getRentRollReport: builder.query<RentRollItem[], { owner_id?: number | null }>({
      query: ({ owner_id }) => ({
        url: '/pm/reports/rent-roll',
        params: owner_id ? { owner_id } : undefined,
      }),
    }),

    getIncomeReport: builder.query<IncomeReport, { owner_id?: number | null; start?: string; end?: string }>({
      query: ({ owner_id, start, end }) => ({
        url: '/pm/reports/income',
        params: {
          owner_id: owner_id || undefined,
          start,
          end,
        },
      }),
    }),

    getExpenseReport: builder.query<ExpenseReport, { owner_id?: number | null; start?: string; end?: string }>({
      query: ({ owner_id, start, end }) => ({
        url: '/pm/reports/expenses',
        params: {
          owner_id: owner_id || undefined,
          start,
          end,
        },
      }),
    }),

    getPnLReport: builder.query<PnLReport, { owner_id?: number | null; start?: string; end?: string }>({
      query: ({ owner_id, start, end }) => ({
        url: '/pm/reports/pnl',
        params: {
          owner_id: owner_id || undefined,
          start,
          end,
        },
      }),
    }),

    getOccupancyReport: builder.query<OccupancyReport, { owner_id?: number | null }>({
      query: ({ owner_id }) => ({
        url: '/pm/reports/occupancy',
        params: owner_id ? { owner_id } : undefined,
      }),
    }),

    getMaintenanceReport: builder.query<MaintenanceReport, { owner_id?: number | null }>({
      query: ({ owner_id }) => ({
        url: '/pm/reports/maintenance',
        params: owner_id ? { owner_id } : undefined,
      }),
    }),

    listPmTenants: builder.query<TenantSummary[], { owner_id?: number | null; limit?: number; offset?: number }>({
      query: ({ owner_id, limit = 50, offset = 0 }) => ({
        url: '/pm/tenants/',
        params: {
          owner_id: owner_id || undefined,
          limit,
          offset,
        },
      }),
    }),

    getPmTenantDetail: builder.query<TenantDetail, { tenant_user_id: number; owner_id?: number | null }>({
      query: ({ tenant_user_id, owner_id }) => ({
        url: `/pm/tenants/${tenant_user_id}`,
        params: { owner_id: owner_id || undefined },
      }),
    }),

    createRMAssignment: builder.mutation<OwnerRMAssignmentResponse, OwnerRMAssignmentCreate>({
      query: (payload) => ({
        url: '/pm/assignments/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PmAssignment', { type: 'User', id: 'LIST' }],
    }),

    listRMAssignments: builder.query<OwnerRMAssignmentResponse[], { owner_id?: number | null }>({
      query: ({ owner_id }) => ({
        url: '/pm/assignments/',
        params: owner_id ? { owner_id } : undefined,
      }),
      providesTags: ['PmAssignment'],
    }),

    updateRMAssignment: builder.mutation<
      OwnerRMAssignmentResponse,
      { owner_user_id: number; payload: OwnerRMAssignmentUpdate }
    >({
      query: ({ owner_user_id, payload }) => ({
        url: `/pm/assignments/${owner_user_id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_res, _e, { owner_user_id }) => [
        'PmAssignment',
        { type: 'User', id: owner_user_id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    createApplicationForm: builder.mutation<RentalApplicationForm, RentalApplicationFormCreate>({
      query: (payload) => ({
        url: '/pm/applications/forms',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PmApplicationForm'],
    }),

    listApplicationForms: builder.query<
      RentalApplicationForm[],
      { owner_id?: number | null; property_id?: number; q?: string; limit?: number; offset?: number }
    >({
      query: ({ owner_id, property_id, q, limit = 50, offset = 0 }) => ({
        url: '/pm/applications/forms',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          q,
          limit,
          offset,
        },
      }),
      providesTags: ['PmApplicationForm'],
    }),

    getApplicationForm: builder.query<RentalApplicationForm, number>({
      query: (form_id) => `/pm/applications/forms/${form_id}`,
      providesTags: (_res, _e, form_id) => [{ type: 'PmApplicationForm', id: form_id }],
    }),

    listApplications: builder.query<
      RentalApplication[],
      {
        owner_id?: number | null
        property_id?: number
        status?: TenantStatus
        submitted_from?: string
        submitted_to?: string
        limit?: number
        offset?: number
      }
    >({
      query: ({ owner_id, property_id, status, submitted_from, submitted_to, limit = 50, offset = 0 }) => ({
        url: '/pm/applications/',
        params: {
          owner_id: owner_id || undefined,
          property_id,
          status,
          submitted_from,
          submitted_to,
          limit,
          offset,
        },
      }),
      providesTags: ['PmApplication'],
    }),

    getApplication: builder.query<RentalApplication, number>({
      query: (application_id) => `/pm/applications/${application_id}`,
      providesTags: (_res, _e, application_id) => [{ type: 'PmApplication', id: application_id }],
    }),

    decideApplication: builder.mutation<RentalApplication, { application_id: number; payload: RentalApplicationDecision }>({
      query: ({ application_id, payload }) => ({
        url: `/pm/applications/${application_id}/decision`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PmApplication'],
    }),
  }),
})

export const {
  useGetPmDashboardOverviewQuery,
  useGetPmDashboardActivityQuery,
  useListPmPropertiesQuery,
  useCreatePmPropertyMutation,
  useGetPmPropertyDetailQuery,
  useUpdatePmPropertyMutation,
  useListPmLeasesQuery,
  useGetPmLeaseQuery,
  useCreatePmLeaseMutation,
  useUploadSignedPmLeaseMutation,
  useRenewPmLeaseMutation,
  useTerminatePmLeaseMutation,
  useGenerateRentChargesMutation,
  useListRentChargesQuery,
  useRecordRentPaymentMutation,
  useListRentPaymentsQuery,
  useCreatePmExpenseMutation,
  useListPmExpensesQuery,
  useUpdatePmExpenseMutation,
  useCreateMaintenanceRequestMutation,
  useListMaintenanceRequestsQuery,
  useUpdateMaintenanceRequestMutation,
  useUploadPmDocumentMutation,
  useListPmDocumentsQuery,
  useUpdatePmDocumentMutation,
  useGetPmDocumentDownloadUrlQuery,
  useCreatePmInspectionMutation,
  useListPmInspectionsQuery,
  useGetPmInspectionQuery,
  useSignPmInspectionMutation,
  useGetRentRollReportQuery,
  useGetIncomeReportQuery,
  useGetExpenseReportQuery,
  useGetPnLReportQuery,
  useGetOccupancyReportQuery,
  useGetMaintenanceReportQuery,
  useListPmTenantsQuery,
  useGetPmTenantDetailQuery,
  useCreateRMAssignmentMutation,
  useListRMAssignmentsQuery,
  useUpdateRMAssignmentMutation,
  useCreateApplicationFormMutation,
  useListApplicationFormsQuery,
  useGetApplicationFormQuery,
  useListApplicationsQuery,
  useGetApplicationQuery,
  useDecideApplicationMutation,
} = pmApi
