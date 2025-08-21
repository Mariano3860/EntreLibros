import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { FeedItem } from '@components/feed/FeedItem.types'

export const fetchCommunityFeed = async (
  page = 0,
  size = 8
): Promise<FeedItem[]> => {
  const response = await apiClient.get<FeedItem[]>(
    RELATIVE_API_ROUTES.COMMUNITY.FEED,
    { params: { page, size } }
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid feed response')
  }

  return response.data
}
