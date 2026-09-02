import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import {
  CommunityCornerDetail,
  CommunityCornerMap,
  CommunityCornerSummary,
  PublishCornerPayload,
  PublishCornerResponse,
  UpdateCornerPayload,
} from './corners.types'

export const cornerKeys = {
  all: ['community', 'corners'] as const,
  detail: (id: string) => [...cornerKeys.all, id] as const,
}

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

export const fetchCornerDetail = async (
  id: string
): Promise<CommunityCornerDetail> => {
  const response = await apiClient.get<CommunityCornerDetail>(
    RELATIVE_API_ROUTES.COMMUNITY.CORNERS.DETAIL(id)
  )
  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Invalid corner detail response')
  }
  return response.data
}

export const updateCorner = async (
  id: string,
  payload: UpdateCornerPayload
): Promise<CommunityCornerDetail> => {
  const response = await apiClient.patch<CommunityCornerDetail>(
    RELATIVE_API_ROUTES.COMMUNITY.CORNERS.UPDATE(id),
    payload
  )
  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Invalid corner update response')
  }
  return response.data
}
