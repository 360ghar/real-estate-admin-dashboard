import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { api } from './services/api'
// Import endpoint modules for side effects so they inject into `api`
import './services/usersApi'
import './services/agentsApi'
import './services/propertiesApi'
import './services/visitsApi'
import './services/bookingsApi'
import './services/amenitiesApi'
import './services/uploadApi'
import './services/coreApi'
import './services/blogsApi'
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
