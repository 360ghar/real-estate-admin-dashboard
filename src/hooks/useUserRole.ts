import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'

export type UserRole = 'admin' | 'agent' | 'user'

export const useUserRole = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as UserRole) || (user?.agent_id ? 'agent' : 'admin')

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
    isUser: role === 'user',
  }
}
