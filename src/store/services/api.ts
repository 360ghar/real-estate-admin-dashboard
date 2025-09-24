import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '..'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearCredentials } from '../slices/authSlice'
import type { User } from '@/types'

/**
 * Raw base query with auth header injection.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * Base query wrapper that:
 * - clears credentials and redirects on 401/403
 * - retries transient network/server errors with exponential backoff
 */
const baseQueryWithReliability: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Exponential backoff retry for transient errors
  const maxRetries = 3
  const baseDelayMs = 400

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await rawBaseQuery(args, api, extraOptions)

    // Handle auth errors
    if (result.error && (result.error.status === 401 || result.error.status === 403)) {
      api.dispatch(clearCredentials())
      // Redirect to login for a clearer UX
      if (typeof window !== 'undefined') {
        // avoid infinite loops: only redirect if not already on /login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
      return result
    }

    // If no error or non-retryable error, return immediately
    if (!result.error) {
      return result
    }

    const status = result.error.status
    const isTransient =
      status === 429 || // too many requests
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      status === 'FETCH_ERROR'

    if (!isTransient || attempt === maxRetries) {
      // Non-transient error or max retries reached
      return result
    }

    // Backoff with jitter
    const jitter = Math.random() * 150
    const delay = baseDelayMs * Math.pow(2, attempt) + jitter
    await new Promise((res) => setTimeout(res, delay))
  }

  // Shouldn't reach here
  return await rawBaseQuery(args, api, extraOptions)
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReliability,
  // Improve reliability and UX: auto-refetch when app regains focus/connectivity,
  // and keep cached data briefly to reduce flicker.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60, // seconds
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
