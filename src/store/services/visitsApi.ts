import { api } from './api'
import type { Visit } from '@/types'

export const visitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listVisits: builder.query<{ results: Visit[]; count?: number }, Record<string, any> | void>({
      query: (params) => ({ url: '/visits/', params: params as Record<string, any> | undefined }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((v) => ({ type: 'Visit' as const, id: v.id })),
              { type: 'Visit' as const, id: 'LIST' },
            ]
          : [{ type: 'Visit' as const, id: 'LIST' }],
    }),
    getVisit: builder.query<Visit, number>({
      query: (id) => `/visits/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'Visit', id }],
    }),
    createVisit: builder.mutation<Visit, Partial<Visit>>({
      query: (body) => ({ url: '/visits/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Visit', id: 'LIST' }],
    }),
    rescheduleVisit: builder.mutation<Visit, { id: number; scheduled_date: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/visits/${id}/reschedule`, method: 'POST', body }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Visit', id }],
    }),
    cancelVisit: builder.mutation<Visit, { id: number; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/visits/${id}/cancel`, method: 'POST', body }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Visit', id }, { type: 'Visit', id: 'LIST' }],
    }),
    completeVisit: builder.mutation<Visit, { id: number; notes?: string; feedback?: string }>({
      query: ({ id, ...body }) => ({ url: `/visits/${id}/complete`, method: 'POST', body }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Visit', id }],
    }),
  }),
})

export const { useListVisitsQuery, useGetVisitQuery, useCreateVisitMutation, useRescheduleVisitMutation, useCancelVisitMutation, useCompleteVisitMutation } = visitsApi
