import { apiClient } from '@api/axios'
import { RELATIVE_API_ROUTES } from '@api/routes'

import type { CommunityDiscovery } from './discovery.types'

export const fetchCommunityDiscovery =
  async (): Promise<CommunityDiscovery> => {
    const response = await apiClient.get<CommunityDiscovery>(
      RELATIVE_API_ROUTES.COMMUNITY.DISCOVERY
    )
    const data = response.data
    if (
      !data ||
      !Array.isArray(data.stories) ||
      !Array.isArray(data.suggestions) ||
      !Array.isArray(data.recommendedBooks)
    ) {
      throw new Error('Invalid community discovery response')
    }
    return data
  }

export type FollowResponse = { following: boolean; userId: string }

export const followCommunityUser = async (
  userId: string
): Promise<FollowResponse> => {
  const response = await apiClient.post<FollowResponse>(
    RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(userId)
  )
  return response.data
}

export const unfollowCommunityUser = async (
  userId: string
): Promise<FollowResponse> => {
  const response = await apiClient.delete<FollowResponse>(
    RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(userId)
  )
  return response.data
}
