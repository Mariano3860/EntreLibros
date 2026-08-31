import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiBook, ApiHomeBooksPage } from './books.types'
import { PublishBookPayload, PublishBookResponse } from './publishBook.types'
export {
  createWantBook,
  toggleBookInterest,
  type BookInterestResponse,
} from './bookInteractions.service'

export type BookCatalogFilters = {
  q?: string
  author?: string
  isbn?: string
  language?: string
  condition?: 'new' | 'very_good' | 'good' | 'acceptable'
  status?: string
  type?: 'offer' | 'want'
  trade?: boolean
  sale?: boolean
  donation?: boolean
  sort?: 'recent' | 'nearby' | 'price_asc' | 'price_desc'
  latitude?: number
  longitude?: number
  radiusKm?: number
  limit?: number
  offset?: number
}

export const fetchBooks = async (
  filters: BookCatalogFilters = {}
): Promise<ApiBook[]> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const response = await apiClient.get<ApiBook[]>(
    `${RELATIVE_API_ROUTES.BOOKS.LIST}${suffix}`
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid books response')
  }

  return response.data
}

export const fetchHomeBooks = async (offset = 0): Promise<ApiHomeBooksPage> => {
  const response = await apiClient.get<ApiHomeBooksPage>(
    `${RELATIVE_API_ROUTES.BOOKS.HOME}?limit=5&offset=${offset}`
  )

  if (
    !response.data ||
    !Array.isArray(response.data.items) ||
    !response.data.page ||
    typeof response.data.page.hasNext !== 'boolean' ||
    typeof response.data.page.hasPrevious !== 'boolean'
  ) {
    throw new Error('Invalid books response')
  }

  return response.data
}

export const fetchBookById = async (id: number): Promise<ApiBook> => {
  const response = await apiClient.get<ApiBook>(
    `${RELATIVE_API_ROUTES.BOOKS.LIST}/${id}`
  )
  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Invalid book response')
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

export const createWantFromBook = async (
  id: string
): Promise<PublishBookResponse> => {
  const response = await apiClient.post<PublishBookResponse>(
    RELATIVE_API_ROUTES.BOOKS.WANT(id)
  )
  if (!response.data || !response.data.id) {
    throw new Error('Invalid want response')
  }
  return response.data
}
