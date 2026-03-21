import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'

export type UserRole = 'admin' | 'agent' | 'user'

export const useUserRole = () => {
  const user = useAppSelector(selectCurrentUser)
  // Only trust explicit role from API; default to 'user' to prevent privilege escalation
  const role: UserRole = (user?.role as UserRole) || 'user'

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
    isUser: role === 'user',
  }
}
