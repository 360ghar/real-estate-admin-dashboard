import { api } from './api'
import type {
  Agent,
  AgentCreate,
  AgentWorkload,
  AgentSystemStats,
  PaginatedResponse
} from '@/types/api'

export interface AgentSummary {
  id: number
  name: string
  email?: string
  phone?: string
  is_active?: boolean
  is_available?: boolean
  users_assigned?: number
}

export interface AgentProfile {
  id: number
  user_id: number
  employee_id: string
  specialization: string
  agent_type: 'general' | 'specialist' | 'senior'
  experience_level: string
  years_of_experience: number
  bio?: string
  languages: string[]
  working_hours?: Record<string, string>
  commission_rate: number
  service_areas: string[]
  max_clients: number
  is_available: boolean
  performance_metrics?: {
    active_clients: number
    properties_sold: number
    total_revenue: number
    average_rating: number
  }
  user?: {
    id: number
    email: string
    full_name: string
    phone: string
  }
}

export const agentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List agents (admin only) - transform to results for existing UI
    listAgents: builder.query<{ results: AgentSummary[]; count?: number }, { include_inactive?: boolean; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/agents/',
        params: { page: 1, limit: 20, ...(params || {}) } as Record<string, any>
      }),
      transformResponse: (response: PaginatedResponse<AgentSummary>) => ({
        results: response.items,
        count: response.total,
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((a) => ({ type: 'Agent' as const, id: a.id })),
              { type: 'Agent' as const, id: 'LIST' },
            ]
          : [{ type: 'Agent' as const, id: 'LIST' }],
    }),

    // Get agent by ID
    getAgent: builder.query<AgentSummary & Record<string, any>, number>({
      query: (id) => `/agents/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Agent', id }],
    }),

    // Create agent (admin only)
    createAgent: builder.mutation<Agent, AgentCreate>({
      query: (data) => ({ url: '/agents/', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    // Update agent (admin only)
    updateAgent: builder.mutation<Agent, { id: number; data: Partial<Agent> }>({
      query: ({ id, data }) => ({ url: `/agents/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Agent', id }],
    }),

    // Delete agent (soft delete, admin only)
    deleteAgent: builder.mutation<void, number>({
      query: (id) => ({ url: `/agents/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    // Toggle agent availability (admin only)
    toggleAgentAvailability: builder.mutation<void, { agentId: number; isAvailable: boolean }>({
      query: ({ agentId, isAvailable }) => ({
        url: `/agents/${agentId}/availability/`,
        method: 'PATCH',
        body: { is_available: isAvailable }
      }),
      invalidatesTags: (_res, _e, { agentId }) => [{ type: 'Agent', id: agentId }],
    }),

    // Get agent profile (current user)
    getAgentProfile: builder.query<Agent, void>({
      query: () => '/agents/me/',
      providesTags: ['Agent']
    }),

    // Get assigned agent (current user)
    getAssignedAgent: builder.query<Agent | null, void>({
      query: () => '/agents/assigned/',
      providesTags: ['Agent']
    }),

    // Assign agent to current user
    assignAgentToUser: builder.mutation<void, { agentId?: number }>({
      query: (params) => ({
        url: '/agents/assign/',
        method: 'POST',
        params: params?.agentId ? { agent_id: params.agentId } : undefined
      }),
      invalidatesTags: ['Agent']
    }),

    // Get available agents
    getAvailableAgents: builder.query<PaginatedResponse<Agent>, { specialization?: string; agentType?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/agents/available/',
        params: { page: 1, limit: 20, ...(params || {}) }
      }),
      providesTags: ['Agent']
    }),

    // Get agent details (public)
    getAgentDetails: builder.query<Agent, number>({
      query: (id) => `/agents/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Agent', id }]
    }),

    // Get agent with stats
    getAgentStats: builder.query<Agent, number>({
      query: (id) => `/agents/${id}/stats/`,
      providesTags: (res, _e, id) => [{ type: 'Agent', id }]
    }),

    // Get visits handled by agent
    getAgentVisits: builder.query<PaginatedResponse<any>, { agentId: number; page?: number; limit?: number }>({
      query: ({ agentId, ...params }) => ({
        url: `/agents/${agentId}/visits/`,
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: ['Agent', 'Visit']
    }),

    // Get agents by type
    getAgentsByType: builder.query<PaginatedResponse<Agent>, { agentType: string; page?: number; limit?: number }>({
      query: ({ agentType, ...params }) => ({
        url: `/agents/types/${agentType}`,
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: ['Agent']
    }),

    // Get agents by specialization
    getAgentsBySpecialization: builder.query<PaginatedResponse<Agent>, { specialization: string; page?: number; limit?: number }>({
      query: ({ specialization, ...params }) => ({
        url: `/agents/specializations/${specialization}`,
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: ['Agent']
    }),

    // Get system workload (admin only)
    getSystemWorkload: builder.query<AgentWorkload[], void>({
      query: () => '/agents/system/workload/',
      providesTags: ['Agent']
    }),

    // Get system stats (admin only)
    getSystemStats: builder.query<AgentSystemStats, void>({
      query: () => '/agents/system/stats/',
      providesTags: ['Agent']
    }),
  }),
})

export const {
  useListAgentsQuery,
  useGetAgentQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useToggleAgentAvailabilityMutation,
  useGetAgentProfileQuery,
  useGetAssignedAgentQuery,
  useAssignAgentToUserMutation,
  useGetAvailableAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAgentStatsQuery,
  useGetAgentVisitsQuery,
  useGetAgentsByTypeQuery,
  useGetAgentsBySpecializationQuery,
  useGetSystemWorkloadQuery,
  useGetSystemStatsQuery
} = agentsApi
