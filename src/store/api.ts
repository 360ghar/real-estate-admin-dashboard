import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { retry } from '@reduxjs/toolkit/query'
import type { RootState } from './index'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearCredentials } from '@/features/auth/slices/authSlice'
import type { User } from '@/types'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithRetries = retry(rawBaseQuery, { maxRetries: 3 })

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQueryWithRetries(args, api, extraOptions)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    api.dispatch(clearCredentials())
  }
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Property',
    'User',
    'Visit',
    'Booking',
    'Agent',
    'Amenity',
    'BugReport',
    'Page',
    'Version',
    'FAQ',
    'Notification',
    'Swipe',
    'BlogPost',
    'BlogCategory',
    'BlogTag',
  ],
  endpoints: (builder) => ({
    login: builder.mutation<
      { access_token: string; token_type?: string; user: User },
      { phone: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { access_token: string; token_type?: string; user: User },
      { phone: string; password: string; full_name?: string; email?: string }
    >({
      query: (payload) => ({
        url: '/auth/register/',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = api
