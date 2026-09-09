import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import {
  ApiBook,
  ApiBookCatalogPage,
  ApiBookRelationsPage,
  ApiHomeBooksPage,
  PersonalBookRelationsTab,
} from './books.types'
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
  topic?: string
  interest?: string
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

export type PersonalBookRelationsFilters = Omit<
  BookCatalogFilters,
  'donation'
> & {
  tab?: PersonalBookRelationsTab
}

const appendFilters = (
  params: URLSearchParams,
  filters: Record<string, unknown>
) => {
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
}

const hasValidCatalogPage = (value: unknown): value is ApiBookCatalogPage => {
  if (!value || typeof value !== 'object') return false
  const page = (value as { page?: unknown }).page
  if (!page || typeof page !== 'object') return false
  const pageData = page as Partial<ApiBookCatalogPage['page']>
  return (
    Array.isArray((value as { items?: unknown }).items) &&
    typeof pageData.limit === 'number' &&
    Number.isInteger(pageData.limit) &&
    pageData.limit > 0 &&
    typeof pageData.offset === 'number' &&
    Number.isInteger(pageData.offset) &&
    pageData.offset >= 0 &&
    typeof pageData.total === 'number' &&
    Number.isInteger(pageData.total) &&
    pageData.total >= 0 &&
    typeof pageData.hasNext === 'boolean' &&
    typeof pageData.hasPrevious === 'boolean'
  )
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

export const fetchPublicBookCatalog = async (
  filters: BookCatalogFilters = {}
): Promise<ApiBookCatalogPage> => {
  const params = new URLSearchParams({ scope: 'all' })
  appendFilters(params, filters)
  const response = await apiClient.get<ApiBookCatalogPage>(
    `${RELATIVE_API_ROUTES.BOOKS.LIST}?${params.toString()}`
  )

  if (!hasValidCatalogPage(response.data)) {
    throw new Error('Invalid public book catalog response')
  }

  return response.data
}

const hasValidBookRelationsPage = (
  value: unknown
): value is ApiBookRelationsPage => {
  if (!hasValidCatalogPage(value)) return false
  const counts = (value as { counts?: unknown }).counts
  if (!counts || typeof counts !== 'object') return false
  return ['all', 'trade', 'sale', 'seeking'].every(
    (key) =>
      typeof (counts as Record<string, unknown>)[key] === 'number' &&
      Number.isInteger((counts as Record<string, unknown>)[key]) &&
      (counts as Record<string, number>)[key] >= 0
  )
}

export const fetchBookRelations = async (
  filters: PersonalBookRelationsFilters = {}
): Promise<ApiBookRelationsPage> => {
  const params = new URLSearchParams({ tab: filters.tab ?? 'all' })
  appendFilters(params, filters)
  const response = await apiClient.get<ApiBookRelationsPage>(
    `${RELATIVE_API_ROUTES.BOOKS.RELATIONS}?${params.toString()}`
  )

  if (!hasValidBookRelationsPage(response.data)) {
    throw new Error('Invalid book relations response')
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
