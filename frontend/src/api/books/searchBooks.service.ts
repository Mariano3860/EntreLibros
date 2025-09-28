import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiBookSearchResult } from './searchBooks.types'

export const searchBooks = async (
  query: string
): Promise<ApiBookSearchResult[]> => {
  const response = await apiClient.get<ApiBookSearchResult[]>(
    `${RELATIVE_API_ROUTES.BOOKS.SEARCH}?query=${encodeURIComponent(query)}`
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid book search response')
  }

  return response.data
}
