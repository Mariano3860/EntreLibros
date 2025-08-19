import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { LoginRequest, LoginResponse } from './login.types'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    RELATIVE_API_ROUTES.AUTH.LOGIN,
    data
  )
  return response.data
}
