import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { RegisterRequest, RegisterResponse } from './register.types'

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    RELATIVE_API_ROUTES.AUTH.REGISTER,
    data
  )
  return response.data
}
