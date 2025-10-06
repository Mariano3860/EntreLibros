import { GeocodingSuggestion } from '@src/api/map/geocoding.types'

const BASE_SUGGESTIONS: GeocodingSuggestion[] = [
  {
    id: 'plaza-mitre-1234',
    label: 'Av. Mitre 1234',
    secondaryLabel: 'Centro, Buenos Aires',
    street: 'Av. Mitre',
    number: '1234',
    postalCode: '1870',
    coordinates: {
      latitude: -34.7082,
      longitude: -58.2779,
    },
  },
  {
    id: 'libertad-987',
    label: 'Libertad 987',
    secondaryLabel: 'Recoleta, CABA',
    street: 'Libertad',
    number: '987',
    postalCode: '1012',
    coordinates: {
      latitude: -34.5964,
      longitude: -58.3861,
    },
  },
  {
    id: 'cordoba-2001',
    label: 'Córdoba 2001',
    secondaryLabel: 'Almagro, CABA',
    street: 'Córdoba',
    number: '2001',
    postalCode: '1187',
    coordinates: {
      latitude: -34.6057,
      longitude: -58.4071,
    },
  },
]

export const generateGeocodingSuggestions = (
  query: string
): GeocodingSuggestion[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return []
  }

  return BASE_SUGGESTIONS.filter((suggestion) =>
    suggestion.label.toLowerCase().includes(normalizedQuery)
  )
}
