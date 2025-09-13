import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import type { AuthUser } from '@src/contexts/auth/AuthContext.types'

export const fetchMe = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>(RELATIVE_API_ROUTES.AUTH.ME, {
    withCredentials: true,
  })
  return response.data
}
