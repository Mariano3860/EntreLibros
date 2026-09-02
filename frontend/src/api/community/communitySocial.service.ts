import { apiClient } from '@api/axios'
import { RELATIVE_API_ROUTES } from '@api/routes'

export type CommunityPostType = 'listing' | 'story'

export type CommunityComment = {
  id: string
  author: string
  avatar: string
  body: string
  createdAt: string
}

export type ToggleCommunityLikeResponse = {
  liked: boolean
  likes: number
}

export const toggleCommunityLike = async (
  postType: CommunityPostType,
  postId: string
): Promise<ToggleCommunityLikeResponse> => {
  const response = await apiClient.post<ToggleCommunityLikeResponse>(
    RELATIVE_API_ROUTES.COMMUNITY.POST_LIKE(postType, postId)
  )
  if (
    !response.data ||
    typeof response.data.liked !== 'boolean' ||
    typeof response.data.likes !== 'number'
  ) {
    throw new Error('Invalid community like response')
  }
  return response.data
}

export const fetchCommunityComments = async (
  postType: CommunityPostType,
  postId: string
): Promise<CommunityComment[]> => {
  const response = await apiClient.get<CommunityComment[]>(
    RELATIVE_API_ROUTES.COMMUNITY.POST_COMMENTS(postType, postId)
  )
  if (
    !Array.isArray(response.data) ||
    !response.data.every(isCommunityComment)
  ) {
    throw new Error('Invalid community comments response')
  }
  return response.data
}

export const createCommunityComment = async (
  postType: CommunityPostType,
  postId: string,
  body: string
): Promise<CommunityComment> => {
  const response = await apiClient.post<CommunityComment>(
    RELATIVE_API_ROUTES.COMMUNITY.POST_COMMENTS(postType, postId),
    { body }
  )
  if (!isCommunityComment(response.data)) {
    throw new Error('Invalid community comment response')
  }
  return response.data
}

const isCommunityComment = (value: unknown): value is CommunityComment => {
  if (!value || typeof value !== 'object') return false
  const comment = value as Record<string, unknown>
  return (
    typeof comment.id === 'string' &&
    typeof comment.author === 'string' &&
    typeof comment.avatar === 'string' &&
    typeof comment.body === 'string' &&
    typeof comment.createdAt === 'string'
  )
}
