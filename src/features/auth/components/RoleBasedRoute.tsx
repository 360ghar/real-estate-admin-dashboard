import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'

type Role = 'admin' | 'agent' | 'user'

interface RoleBasedRouteProps {
  allowedRoles: Role[]
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const currentUser = useAppSelector(selectCurrentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Prefer explicit role from API; fall back for older payloads
  const role: Role = (currentUser.role as Role) || (currentUser.agent_id ? 'agent' : 'admin')

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}

export default RoleBasedRoute
