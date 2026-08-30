import { apiClient } from '@api/axios'
import { RELATIVE_API_ROUTES } from '@api/routes'
import type { FeedItem } from '@components/feed/FeedItem.types'

export type CreateCommunityStoryPayload = {
  body: string
  imageUrl?: string | null
  bookListingId?: string | null
}

export const createCommunityStory = async (
  payload: CreateCommunityStoryPayload
): Promise<FeedItem> => {
  const response = await apiClient.post<FeedItem>(
    RELATIVE_API_ROUTES.COMMUNITY.STORIES,
    payload
  )
  return response.data
}
