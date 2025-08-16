import { apiClient } from '@/api/axios'
import { RELATIVE_API_ROUTES } from '@/api/routes'

import { Book } from './books.types'

export const fetchBooks = async (): Promise<Book[]> => {
  const response = await apiClient.get<Book[]>(RELATIVE_API_ROUTES.BOOKS.LIST)
  return response.data
}
