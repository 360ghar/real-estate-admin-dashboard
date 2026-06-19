import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectAuthInitialized, selectCurrentUser, selectIsAuthenticated } from '@/features/auth/slices/authSlice'
import { PageLoading } from '@/components/common/PageLoading'

const PrivateRoute = () => {
  const initialized = useAppSelector(selectAuthInitialized)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 10000)
    return () => clearTimeout(id)
  }, [])

  if (!initialized) {
    if (timedOut) return <Navigate to="/login?error=session-timeout" replace />
    return <PageLoading />
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default PrivateRoute
