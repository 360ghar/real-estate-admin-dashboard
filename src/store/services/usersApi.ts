import { api } from './api'
import type { User } from '@/types'

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<{ results: User[]; count?: number }, { agent_id?: number; q?: string; page?: number; page_size?: number } | void>({
      query: (params) => ({ url: '/users/', params: params as unknown as Record<string, any> | undefined }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({ url: `/users/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'User', id }],
    }),
    assignAgent: builder.mutation<{ success: boolean }, { userId: number; agentId: number }>({
      query: ({ userId, agentId }) => ({ url: `/users/${userId}/assign-agent/`, method: 'POST', body: { agent_id: agentId } }),
      invalidatesTags: (_res, _e, { userId }) => [{ type: 'User', id: userId }, { type: 'User', id: 'LIST' }],
    }),
  }),
})

export const { useListUsersQuery, useGetUserQuery, useUpdateUserMutation } = usersApi
