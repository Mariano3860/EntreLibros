import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { GeocodingSuggestion } from './geocoding.types'

const isGeocodingSuggestion = (
  value: unknown
): value is GeocodingSuggestion => {
  if (!value || typeof value !== 'object') return false
  const suggestion = value as Record<string, unknown>
  return (
    typeof suggestion.id === 'string' &&
    typeof suggestion.label === 'string' &&
    typeof suggestion.street === 'string' &&
    typeof suggestion.number === 'string' &&
    suggestion.coordinates !== undefined &&
    typeof (suggestion.coordinates as Record<string, unknown>).latitude ===
      'number' &&
    typeof (suggestion.coordinates as Record<string, unknown>).longitude ===
      'number'
  )
}

export const searchAddressSuggestions = async (
  query: string
): Promise<GeocodingSuggestion[]> => {
  const trimmedQuery = query.trim()
  if (trimmedQuery === '') {
    return []
  }

  const response = await apiClient.get<unknown>(
    RELATIVE_API_ROUTES.MAP.GEOCODE,
    {
      params: { q: trimmedQuery },
    }
  )

  const data = response.data
  if (!Array.isArray(data)) {
    throw new Error('Invalid geocoding response')
  }

  const suggestions = data.filter(isGeocodingSuggestion)
  if (suggestions.length !== data.length) {
    throw new Error('Invalid geocoding suggestion in response')
  }

  return suggestions
}
