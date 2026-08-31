import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import type {
  CreateWantBookPayload,
  PublishBookResponse,
} from './publishBook.types'

export type BookInterestResponse = {
  listingId: string
  interested: boolean
}

export const toggleBookInterest = async (
  id: string
): Promise<BookInterestResponse> => {
  const response = await apiClient.post<BookInterestResponse>(
    RELATIVE_API_ROUTES.BOOKS.INTEREST(id)
  )
  if (
    !response.data ||
    response.data.listingId !== String(id) ||
    typeof response.data.interested !== 'boolean'
  ) {
    throw new Error('Invalid interest response')
  }
  return response.data
}

export const createWantBook = async (
  payload: CreateWantBookPayload
): Promise<PublishBookResponse> => {
  const response = await apiClient.post<PublishBookResponse>(
    RELATIVE_API_ROUTES.BOOKS.PUBLISH,
    payload
  )
  if (!response.data || !response.data.id) {
    throw new Error('Invalid want response')
  }
  return response.data
}
