import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export const useAuth = () => {
  const { token, user, isLoading, error } = useSelector((state: RootState) => state.auth)

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated: !!token
  }
}