import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiBook } from './books.types'

export const fetchBooks = async (): Promise<ApiBook[]> => {
  const response = await apiClient.get<ApiBook[]>(
    RELATIVE_API_ROUTES.BOOKS.LIST
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid books response')
  }

  return response.data
}
