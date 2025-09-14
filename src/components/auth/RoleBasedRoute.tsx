import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import type { Role } from '@/types'

interface RoleBasedRouteProps {
  allowedRoles: Role[]
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const currentUser = useAppSelector(selectCurrentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const role: Role = currentUser.agent_id ? 'agent' : 'admin'

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}

export default RoleBasedRoute

