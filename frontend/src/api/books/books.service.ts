import { isAxiosError } from 'axios'

import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiBook } from './books.types'
import {
  Publication,
  PublicationApiError,
  PublicationUpdate,
  PublicationErrorType,
} from './publication.types'
import { PublishBookPayload, PublishBookResponse } from './publishBook.types'

type ApiErrorResponse = {
  message?: string
  errors?: Record<string, string[]>
}

const parseApiError = (input: unknown): ApiErrorResponse => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const message =
    'message' in input && typeof input.message === 'string'
      ? input.message
      : undefined

  const errorsSource =
    'errors' in input && typeof input.errors === 'object' && input.errors
      ? (input.errors as Record<string, unknown>)
      : undefined

  if (!errorsSource) {
    return { message }
  }

  const errors: Record<string, string[]> = {}

  for (const [key, value] of Object.entries(errorsSource)) {
    if (!Array.isArray(value)) continue
    const entries = value.filter(
      (item): item is string => typeof item === 'string'
    )
    if (entries.length > 0) {
      errors[key] = entries
    }
  }

  return {
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

const createPublicationError = (
  type: PublicationErrorType,
  fallbackMessage: string,
  status?: number,
  details?: Record<string, string[]>,
  messageOverride?: string
) =>
  new PublicationApiError(
    messageOverride || fallbackMessage,
    type,
    status,
    details
  )

const mapPublicationError = (error: unknown): PublicationApiError => {
  if (isAxiosError(error)) {
    const { response, message } = error

    if (!response) {
      return createPublicationError(
        'network',
        'Network error',
        undefined,
        undefined,
        message
      )
    }

    const { status, data } = response
    const parsed = parseApiError(data)

    if (status === 404) {
      return createPublicationError(
        'not_found',
        'Publication not found',
        status,
        parsed.errors,
        parsed.message
      )
    }

    if (status === 403) {
      return createPublicationError(
        'forbidden',
        'You cannot edit this publication',
        status,
        parsed.errors,
        parsed.message
      )
    }

    if (status === 400) {
      return createPublicationError(
        'validation',
        'The publication could not be updated',
        status,
        parsed.errors,
        parsed.message
      )
    }

    return createPublicationError(
      'unknown',
      'Unexpected publication error',
      status,
      parsed.errors,
      parsed.message
    )
  }

  if (error instanceof Error) {
    return createPublicationError('unknown', error.message)
  }

  return createPublicationError('unknown', 'Unexpected publication error')
}

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

export const getBookById = async (id: string): Promise<Publication> => {
  try {
    const response = await apiClient.get<Publication>(
      RELATIVE_API_ROUTES.BOOKS.DETAIL(id)
    )

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid publication response')
    }

    return response.data
  } catch (error) {
    throw mapPublicationError(error)
  }
}

export const updateBook = async (
  id: string,
  input: PublicationUpdate
): Promise<Publication> => {
  try {
    const response = await apiClient.put<Publication>(
      RELATIVE_API_ROUTES.BOOKS.DETAIL(id),
      input
    )

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid publication response')
    }

    return response.data
  } catch (error) {
    throw mapPublicationError(error)
  }
}
