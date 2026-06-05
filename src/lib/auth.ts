import type { User } from '@/types'
import { API_BASE_URL } from '@/lib/config'

export async function fetchUserProfileWithToken(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return (await res.json()) as User
  } catch {
    return null
  }
}
