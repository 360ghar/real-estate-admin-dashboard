import { api } from '@/store/api'
import type { AgentSystemStats, AgentWorkload } from '@/types/api'

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSystemStats: builder.query<AgentSystemStats, void>({
      query: () => '/agents/system/stats/',
      providesTags: [{type: 'Agent' as const, id: 'LIST'}, {type: 'PmDashboard' as const, id: 'SYSTEM_STATS'}],
      keepUnusedDataFor: 300,
    }),
    getWorkload: builder.query<AgentWorkload[], void>({
      query: () => '/agents/system/workload/',
      providesTags: [{type: 'Agent' as const, id: 'LIST'}, {type: 'PmDashboard' as const, id: 'SYSTEM_WORKLOAD'}],
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useGetSystemStatsQuery, useGetWorkloadQuery } = systemApi

