import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import type { UserActivityItem } from './activity.types'

export const fetchUserActivity = async (): Promise<UserActivityItem[]> => {
  const response = await apiClient.get<UserActivityItem[]>(
    RELATIVE_API_ROUTES.USER.ACTIVITY
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid user activity response')
  }

  return response.data
}
