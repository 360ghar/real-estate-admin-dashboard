import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { retry } from '@reduxjs/toolkit/query'
import type { RootState } from '..'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearCredentials } from '../slices/authSlice'
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
    'AppUpdate',
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
  }),
})

export const { useLoginMutation } = api
