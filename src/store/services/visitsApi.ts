import { api } from './api'
import type {
  Visit,
  VisitCreate,
  VisitUpdate,
  VisitList,
  PaginatedResponse
} from '@/types/api'

export interface VisitsQuery {
  page?: number
  limit?: number
  status?: string
  agent_id?: number
  property_id?: number
  user_id?: number
}

export const visitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Schedule a visit
    scheduleVisit: builder.mutation<Visit, VisitCreate>({
      query: (data) => ({
        url: '/visits/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Visit', 'Property']
    }),

    // Get current user's visits
    getUserVisits: builder.query<VisitList, void>({
      query: () => '/visits/',
      providesTags: ['Visit']
    }),

    // Get upcoming visits for current user
    getUpcomingVisits: builder.query<Visit[], void>({
      query: () => '/visits/upcoming/',
      providesTags: ['Visit']
    }),

    // Get past visits for current user
    getPastVisits: builder.query<Visit[], void>({
      query: () => '/visits/past/',
      providesTags: ['Visit']
    }),

    // Get visit details
    getVisit: builder.query<Visit, number>({
      query: (id) => `/visits/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Visit', id }]
    }),

    // Update visit details
    updateVisit: builder.mutation<Visit, { id: number; data: VisitUpdate }>({
      query: ({ id, data }) => ({
        url: `/visits/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'Visit', id }]
    }),

    // Reschedule a visit
    rescheduleVisit: builder.mutation<Visit, { visitId: number; newDate: string; reason: string }>({
      query: ({ visitId, ...data }) => ({
        url: `/visits/${visitId}/reschedule`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { visitId }) => [{ type: 'Visit', id: visitId }]
    }),

    // Cancel a visit
    cancelVisit: builder.mutation<Visit, { visitId: number; reason: string }>({
      query: ({ visitId, ...data }) => ({
        url: `/visits/${visitId}/cancel`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { visitId }) => [{ type: 'Visit', id: visitId }]
    }),

    // Get all visits (admin/agent view)
    getAllVisits: builder.query<PaginatedResponse<Visit>, VisitsQuery>({
      query: (params) => ({
        url: '/visits/all/',
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((v) => ({ type: 'Visit' as const, id: v.id })),
              { type: 'Visit' as const, id: 'LIST' },
            ]
          : [{ type: 'Visit' as const, id: 'LIST' }],
    }),

    // Complete visit (admin/agent)
    completeVisit: builder.mutation<Visit, { visitId: number; notes?: string; feedback?: string }>({
      query: ({ visitId, ...data }) => ({
        url: `/visits/${visitId}/complete/`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (res, _e, { visitId }) => [{ type: 'Visit', id: visitId }]
    }),

    // Legacy list visits (for backward compatibility)
    listVisits: builder.query<{ results: Visit[]; count?: number }, VisitsQuery>({
      query: (params) => ({
        url: '/visits/all/',
        params: { page: 1, limit: 20, ...params }
      }),
      transformResponse: (response: PaginatedResponse<Visit>) => ({
        results: response.items,
        count: response.total
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((v) => ({ type: 'Visit' as const, id: v.id })),
              { type: 'Visit' as const, id: 'LIST' },
            ]
          : [{ type: 'Visit' as const, id: 'LIST' }],
    }),

    // Get visit by ID (legacy)
    getVisitById: builder.query<Visit, number>({
      query: (id) => `/visits/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Visit', id }]
    }),

    // Create visit (legacy)
    createVisit: builder.mutation<Visit, Omit<Visit, 'id'>>({
      query: (data) => ({
        url: '/visits/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Visit', 'Property']
    }),

    // Update visit (legacy)
    updateVisitById: builder.mutation<Visit, { id: number; data: Partial<Visit> }>({
      query: ({ id, data }) => ({
        url: `/visits/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'Visit', id }]
    }),

    // Delete visit (legacy)
    deleteVisit: builder.mutation<void, number>({
      query: (id) => ({
        url: `/visits/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (res, _e, id) => [{ type: 'Visit', id }]
    }),
  }),
})

export const {
  useScheduleVisitMutation,
  useGetUserVisitsQuery,
  useGetUpcomingVisitsQuery,
  useGetPastVisitsQuery,
  useGetVisitQuery,
  useUpdateVisitMutation,
  useRescheduleVisitMutation,
  useCancelVisitMutation,
  useGetAllVisitsQuery,
  useCompleteVisitMutation,
  useListVisitsQuery,
  useGetVisitByIdQuery,
  useCreateVisitMutation,
  useUpdateVisitByIdMutation,
  useDeleteVisitMutation,
} = visitsApi