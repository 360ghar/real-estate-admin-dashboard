import { api } from './api'

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSystemStats: builder.query<Record<string, any>, void>({
      query: () => '/agents/system/stats/',
    }),
    getWorkload: builder.query<Record<string, any>, void>({
      query: () => '/agents/system/workload/',
    }),
  }),
})

export const { useGetSystemStatsQuery, useGetWorkloadQuery } = systemApi

