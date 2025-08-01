import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

export const logout = async (): Promise<void> => {
  await apiClient.post(RELATIVE_API_ROUTES.AUTH.LOGOUT)
}
