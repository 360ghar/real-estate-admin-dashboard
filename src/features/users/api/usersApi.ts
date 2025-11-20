import { api } from '@/store/api'
import type { PaginatedResponse, User } from '@/types'

export interface UserPreferences {
  property_type?: string[]
  purpose?: string
  budget_min?: number
  budget_max?: number
  bedrooms_min?: number
  bedrooms_max?: number
  area_min?: number
  area_max?: number
  location_preference?: string[]
  max_distance_km?: number
}

export interface UserUpdate {
  email?: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  profile_image_url?: string
  preferences?: UserPreferences
  current_latitude?: number
  current_longitude?: number
  preferred_locations?: string[]
  notification_settings?: Record<string, any>
  privacy_settings?: Record<string, any>
}

export interface UsersQuery {
  page?: number
  limit?: number
  q?: string
  agent_id?: number
}

export interface TypedUserNotificationPayload {
  userId: number
  typeKey: string
  title: string
  body: string
  data?: Record<string, string>
  deep_link?: string
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List users with pagination and search
    getUsers: builder.query<PaginatedResponse<User>, UsersQuery>({
      query: (params) => ({
        url: '/users/',
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    // Legacy list users (for backward compatibility)
    listUsers: builder.query<{ results: User[]; count?: number }, UsersQuery | void>({
      query: (params) => ({
        url: '/users/',
        params: { page: 1, limit: 20, ...params } as Record<string, any>
      }),
      transformResponse: (response: PaginatedResponse<User>) => ({
        results: response.items,
        count: response.total
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    // Get user details
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'User', id }],
    }),

    // Update user
    updateUser: builder.mutation<User, { id: number; data: Partial<UserUpdate> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    // Assign agent to user
    assignAgent: builder.mutation<void, { userId: number; agentId: number }>({
      query: ({ userId, agentId }) => ({
        url: `/users/${userId}/assign-agent/`,
        method: 'POST',
        body: { agent_id: agentId }
      }),
      invalidatesTags: (_res, _e, { userId }) => [{ type: 'User', id: userId }, { type: 'User', id: 'LIST' }],
    }),

    // Get current user's profile
    getProfile: builder.query<User, void>({
      query: () => '/users/profile/',
      providesTags: ['User'],
    }),

    // Update current user's profile
    updateProfile: builder.mutation<User, Partial<UserUpdate>>({
      query: (data) => ({
        url: '/users/profile/',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['User'],
    }),

    // Update user preferences
    updatePreferences: builder.mutation<void, UserPreferences>({
      query: (data) => ({
        url: '/users/preferences/',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['User'],
    }),

    // Update user location
    updateLocation: builder.mutation<void, { latitude: number; longitude: number }>({
      query: (data) => ({
        url: '/users/location/',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['User'],
    }),

    // Send a typed notification to a user (multi-channel, backend-controlled)
    sendTypedNotification: builder.mutation<void, TypedUserNotificationPayload>({
      query: ({ userId, typeKey, title, body, data, deep_link }) => ({
        url: '/notifications/send/typed/user',
        method: 'POST',
        body: {
          user_id: userId,
          type_key: typeKey,
          title,
          body,
          data,
          deep_link,
        },
      }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useAssignAgentMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useUpdateLocationMutation,
  useSendTypedNotificationMutation,
} = usersApi
