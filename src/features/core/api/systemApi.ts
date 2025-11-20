import { api } from '@/store/api'
import type { AgentSystemStats, AgentWorkload } from '@/types'

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSystemStats: builder.query<AgentSystemStats, void>({
      query: () => '/agents/system/stats/',
    }),
    getWorkload: builder.query<AgentWorkload[], void>({
      query: () => '/agents/system/workload/',
    }),
  }),
})

export const { useGetSystemStatsQuery, useGetWorkloadQuery } = systemApi
