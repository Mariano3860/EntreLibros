import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

import { LoginRequest, LoginResponse } from './login.types'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    RELATIVE_API_ROUTES.AUTH.LOGIN,
    data
  )
  return response.data
}
