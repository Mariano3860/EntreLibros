import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { SuggestionItem } from './suggestions.types'

export const fetchSuggestions = async (): Promise<SuggestionItem[]> => {
  const response = await apiClient.get<SuggestionItem[]>(
    RELATIVE_API_ROUTES.COMMUNITY.SUGGESTIONS
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid suggestions response')
  }

  return response.data
}
