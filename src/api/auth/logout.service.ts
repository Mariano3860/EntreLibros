import { apiClient } from '@/api/axios'
import { API_ROUTES } from '@/api/routes'

export const logout = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.LOGOUT)
}
