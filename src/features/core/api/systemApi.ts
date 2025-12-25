import { api } from '@/store/api'

export interface SystemStats {
  active_agents?: number
  active_users?: number
  properties_listed?: number
  occupancy_rate?: number
  [key: string]: number | string | undefined
}

export type WorkloadDatum = { name: string; value: number }
export type WorkloadResponse = Record<string, number> | WorkloadDatum[]

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSystemStats: builder.query<SystemStats, void>({
      query: () => '/agents/system/stats/',
    }),
    getWorkload: builder.query<WorkloadResponse, void>({
      query: () => '/agents/system/workload/',
    }),
  }),
})

export const { useGetSystemStatsQuery, useGetWorkloadQuery } = systemApi

