export type GeocodingSuggestion = {
  id: string
  label: string
  secondaryLabel?: string
  street: string
  number: string
  postalCode?: string
  coordinates: {
    latitude: number
    longitude: number
  }
}
