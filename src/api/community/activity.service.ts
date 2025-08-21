import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ActivityItem } from './activity.types'

export const fetchActivityItems = async (): Promise<ActivityItem[]> => {
  const response = await apiClient.get<ActivityItem[]>(
    RELATIVE_API_ROUTES.COMMUNITY.ACTIVITY
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid activity response')
  }

  return response.data
}
