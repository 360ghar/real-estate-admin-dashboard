import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice'

const PrivateRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default PrivateRoute

