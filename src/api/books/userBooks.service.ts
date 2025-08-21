import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiUserBook } from './userBooks.types'

export const fetchUserBooks = async (): Promise<ApiUserBook[]> => {
  const response = await apiClient.get<ApiUserBook[]>(
    RELATIVE_API_ROUTES.BOOKS.MINE
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid books response')
  }

  return response.data
}
