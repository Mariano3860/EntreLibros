import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

import { ApiBook } from './books.types'

export const fetchBooks = async (): Promise<ApiBook[]> => {
  const response = await apiClient.get<ApiBook[]>(
    RELATIVE_API_ROUTES.BOOKS.LIST
  )
  return response.data
}
