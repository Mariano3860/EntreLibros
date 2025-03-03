// src/api/auth/logout.service.ts
import { apiClient } from '@/api/axios'
import { API_ROUTES } from '@/api/routes'

// Service for handling logout API call
export const logout = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.LOGOUT)
}
