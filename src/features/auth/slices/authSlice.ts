import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  initialized: boolean
  error: string | null
}

export function loadUserFromStorage(): User | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed?.id) return null
    return parsed as unknown as User
  } catch {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('user')
    return null
  }
}

const initialState: AuthState = {
  token: null,
  user: loadUserFromStorage(),
  initialized: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token?: string | null; user: User }>) => {
      if (action.payload.token !== undefined) {
        state.token = action.payload.token
      }
      state.user = action.payload.user
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    clearCredentials: (state) => {
      state.token = null
      state.user = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user')
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, setInitialized, setError } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => !!state.auth.token && !!state.auth.user
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthInitialized = (state: RootState) => state.auth.initialized

export default authSlice.reducer
