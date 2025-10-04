export type MapLayerKey = 'corners' | 'publications' | 'activity'

export interface MapBoundingBox {
  north: number
  south: number
  east: number
  west: number
}

export interface MapCornerPin {
  id: string
  name: string
  barrio: string
  city: string
  lat: number
  lon: number
  lastSignalAt: string | null
  photos: string[]
  rules?: string
  referencePointLabel?: string
  themes: string[]
  isOpenNow?: boolean
}

export type PublicationType = 'offer' | 'want' | 'donation' | 'sale'

export interface MapPublicationPin {
  id: string
  title: string
  authors: string[]
  type: PublicationType
  photo?: string
  distanceKm: number
  cornerId: string
  lat?: number
  lon?: number
}

export interface MapActivityPoint {
  id: string
  lat: number
  lon: number
  intensity: number
}

export interface MapFilters {
  distanceKm: number
  themes: string[]
  openNow: boolean
  recentActivity: boolean
}

export interface MapLayerToggles {
  corners: boolean
  publications: boolean
  activity: boolean
}

export interface MapQueryInput {
  bbox: MapBoundingBox
  searchTerm?: string
  filters: MapFilters
  layers: MapLayerToggles
  locale: string
}

export interface MapResponseMeta {
  bbox: MapBoundingBox
  generatedAt: string
}

export interface MapResponse {
  corners: MapCornerPin[]
  publications: MapPublicationPin[]
  activity: MapActivityPoint[]
  meta: MapResponseMeta
}

export type MapPin =
  | { type: 'corner'; data: MapCornerPin }
  | { type: 'publication'; data: MapPublicationPin }
