import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { CommunityStats } from './communityStats.types'

export const fetchCommunityStats = async (): Promise<CommunityStats> => {
  const response = await apiClient.get<CommunityStats>(
    RELATIVE_API_ROUTES.COMMUNITY.STATS
  )

  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Invalid community stats response')
  }

  return response.data
}
