import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(RELATIVE_API_ROUTES.AUTH.LOGOUT)
  } finally {
    if (!import.meta.env.PROD) {
      // In development the auth cookie isn't HttpOnly/secure, so we clear it manually.
      // In production the server sets HttpOnly/secure cookies and is responsible for
      // clearing them via Set-Cookie headers.
      const { clearAllCookies } = await import('@utils/cookies')
      clearAllCookies()
    }
  }
}
