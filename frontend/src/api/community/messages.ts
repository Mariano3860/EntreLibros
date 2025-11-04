import { apiClient } from '../axios'
import { RELATIVE_API_ROUTES } from '../routes'

export type BookAvailabilityResponse = {
  available: boolean
}

export const fetchBookAvailability = async (bookTitle: string) => {
  const response = await apiClient.get<BookAvailabilityResponse>(
    RELATIVE_API_ROUTES.COMMUNITY.MESSAGES.AVAILABILITY,
    {
      params: { book: bookTitle },
    }
  )
  return response.data
}
