import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import type {
  PublicProfile,
  UpdateProfileRequest,
  UserProfile,
} from './profile.types'

export const fetchProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(
    RELATIVE_API_ROUTES.USER.PROFILE,
    { withCredentials: true }
  )
  return response.data
}

export const fetchPublicProfile = async (
  id: number
): Promise<PublicProfile> => {
  const response = await apiClient.get<PublicProfile>(
    RELATIVE_API_ROUTES.USER.PUBLIC_PROFILE(id)
  )
  return response.data
}

export const updateProfile = async (
  profile: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(
    RELATIVE_API_ROUTES.USER.PROFILE,
    profile,
    { withCredentials: true }
  )
  return response.data
}
