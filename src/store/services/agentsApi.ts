import { api } from './api'

export interface AgentSummary {
  id: number
  name: string
  email?: string
  phone?: string
  is_active?: boolean
  is_available?: boolean
  users_assigned?: number
}

export const agentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAgents: builder.query<{ results: AgentSummary[]; count?: number }, { include_inactive?: boolean } | void>({
      query: (params) => ({ url: '/agents/', params: params as Record<string, any> | undefined }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((a) => ({ type: 'Agent' as const, id: a.id })),
              { type: 'Agent' as const, id: 'LIST' },
            ]
          : [{ type: 'Agent' as const, id: 'LIST' }],
    }),
    getAgent: builder.query<AgentSummary & Record<string, any>, number>({
      query: (id) => `/agents/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'Agent', id }],
    }),
    createAgent: builder.mutation<AgentSummary, Partial<AgentSummary>>({
      query: (body) => ({ url: '/agents/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),
    updateAgent: builder.mutation<AgentSummary, { id: number; data: Partial<AgentSummary> }>({
      query: ({ id, data }) => ({ url: `/agents/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Agent', id }],
    }),
    getAgentStats: builder.query<Record<string, any>, number>({
      query: (id) => `/agents/${id}/stats/`,
    }),
  }),
})

export const { useListAgentsQuery, useGetAgentQuery, useCreateAgentMutation, useUpdateAgentMutation, useGetAgentStatsQuery } = agentsApi
