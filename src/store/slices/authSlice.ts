import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '..'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  user:
    typeof localStorage !== 'undefined' && localStorage.getItem('user')
      ? (JSON.parse(localStorage.getItem('user') as string) as User)
      : null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    clearCredentials: (state) => {
      state.token = null
      state.user = null
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => !!state.auth.token
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectAuthError = (state: RootState) => state.auth.error

export default authSlice.reducer
