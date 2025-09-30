import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiBook } from './books.types'
import { PublishBookPayload, PublishBookResponse } from './publishBook.types'

export const fetchBooks = async (): Promise<ApiBook[]> => {
  const response = await apiClient.get<ApiBook[]>(
    RELATIVE_API_ROUTES.BOOKS.LIST
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid books response')
  }

  return response.data
}

export const publishBook = async (
  payload: PublishBookPayload
): Promise<PublishBookResponse> => {
  const response = await apiClient.post<PublishBookResponse>(
    RELATIVE_API_ROUTES.BOOKS.PUBLISH,
    payload
  )

  if (!response.data || !response.data.id) {
    throw new Error('Invalid publish response')
  }

  return response.data
}
