import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { Publication, PublicationUpdate } from './publication.types'

/**
 * Get a publication by ID
 */
export const getBookById = async (id: string): Promise<Publication> => {
  const response = await apiClient.get<Publication>(
    `${RELATIVE_API_ROUTES.BOOKS.LIST}/${id}`
  )

  if (!response.data || !response.data.id) {
    throw new Error('Invalid book response')
  }

  return response.data
}

/**
 * Update a publication by ID
 */
export const updateBook = async (
  id: string,
  input: PublicationUpdate
): Promise<Publication> => {
  const response = await apiClient.put<Publication>(
    `${RELATIVE_API_ROUTES.BOOKS.LIST}/${id}`,
    input
  )

  if (!response.data || !response.data.id) {
    throw new Error('Invalid update response')
  }

  return response.data
}
