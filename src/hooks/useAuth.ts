import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export const useAuth = () => {
  const { token, user, initialized, error } = useSelector((state: RootState) => state.auth)

  return {
    token,
    user,
    initialized,
    error,
    isAuthenticated: !!token && !!user
  }
}
