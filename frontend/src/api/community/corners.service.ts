import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import {
  CommunityCornerMap,
  CommunityCornerSummary,
  PublishCornerPayload,
  PublishCornerResponse,
} from './corners.types'

export const fetchNearbyCorners = async (): Promise<
  CommunityCornerSummary[]
> => {
  const response = await apiClient.get<CommunityCornerSummary[]>(
    RELATIVE_API_ROUTES.COMMUNITY.CORNERS.NEARBY
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid corners response')
  }

  return response.data
}

export const fetchCornersMap = async (): Promise<CommunityCornerMap> => {
  const response = await apiClient.get<CommunityCornerMap>(
    RELATIVE_API_ROUTES.COMMUNITY.CORNERS.MAP
  )

  if (!response.data || !Array.isArray(response.data.pins)) {
    throw new Error('Invalid corners map response')
  }

  return response.data
}

export const createCorner = async (
  payload: PublishCornerPayload
): Promise<PublishCornerResponse> => {
  const response = await apiClient.post<PublishCornerResponse>(
    RELATIVE_API_ROUTES.COMMUNITY.CORNERS.CREATE,
    payload
  )

  return response.data
}
