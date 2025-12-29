import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'

export type UserRole = 'admin' | 'agent' | 'user'

export const useUserRole = () => {
  const user = useAppSelector(selectCurrentUser)
  // Default to 'user' role if not specified to prevent privilege escalation
  // Only trust explicit role from API; agent_id is secondary indicator
  const role: UserRole = (user?.role as UserRole) || (user?.agent_id ? 'agent' : 'user')

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
    isUser: role === 'user',
  }
}
