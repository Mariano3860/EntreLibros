import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

export const fetchMe = async () => {
  const response = await apiClient.get(RELATIVE_API_ROUTES.AUTH.ME, {
    withCredentials: true,
  })
  return response.data
}
