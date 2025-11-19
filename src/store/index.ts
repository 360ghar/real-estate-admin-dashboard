import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/slices/authSlice'
import { api } from './api'
// Import endpoint modules for side effects so they inject into `api`
import '@/features/users/api/usersApi'
import '@/features/agents/api/agentsApi'
import '@/features/properties/api/propertiesApi'
import '@/features/visits/api/visitsApi'
import '@/features/bookings/api/bookingsApi'
import '@/features/core/api/amenitiesApi'
import '@/features/core/api/notificationsApi'
import '@/features/core/api/systemApi'
import '@/features/blog/api/blogsApi'
// Reviews module removed

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
