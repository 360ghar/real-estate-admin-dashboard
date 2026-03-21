import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { retry } from '@reduxjs/toolkit/query'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearCredentials } from '@/features/auth/slices/authSlice'
import { supabase } from '@/lib/supabase'

interface AuthState {
  token: string | null
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api/v1',
  prepareHeaders: async (headers, { getState }) => {
    let token = (getState() as { auth: AuthState }).auth.token
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      token = data.session?.access_token ?? token
    }
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

// Wrap rawBaseQuery to bail out of retries on auth errors (401/403)
const baseQueryNoRetryOnAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  // Signal retry to stop on 401/403 by using retry.fail()
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    retry.fail(result.error)
  }
  return result
}

const baseQueryWithRetries = retry(baseQueryNoRetryOnAuth, { maxRetries: 3 })

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQueryWithRetries(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    if (supabase) {
      await supabase.auth.signOut()
    }
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
    'Swipe',
    // Property Management (PM)
    'PmDashboard',
    'PmProperty',
    'PmLease',
    'PmRentCharge',
    'PmRentPayment',
    'PmExpense',
    'PmMaintenanceRequest',
    'PmDocument',
    'PmInspection',
    'PmAssignment',
    'PmApplicationForm',
    'PmApplication',
  ],
  endpoints: () => ({}),
})
