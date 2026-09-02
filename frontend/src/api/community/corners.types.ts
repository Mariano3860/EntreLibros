export type CommunityCornerSummary = {
  id: string
  name: string
  imageUrl: string
  distanceKm: number
  activityLabel?: string
}

export type CommunityCornerMapPin = {
  id: string
  name: string
  x: number
  y: number
  status: 'active' | 'quiet'
}

export type CommunityCornerMap = {
  pins: CommunityCornerMapPin[]
  description?: string
}

export type PublishCornerScope = 'public' | 'semiprivate'

export type PublishCornerVisibilityPreference = 'exact' | 'approximate'

export type PublishCornerAddress = {
  street: string
  number: string
  unit?: string
  postalCode?: string
}

export type PublishCornerCoordinates = {
  latitude: number
  longitude: number
}

export type PublishCornerLocationPayload = {
  address: PublishCornerAddress
  coordinates: PublishCornerCoordinates
  visibilityPreference: PublishCornerVisibilityPreference
}

export type PublishCornerStatus = 'active' | 'paused'

export type PublishCornerPhoto = {
  id: string
  url: string
}

export type PublishCornerPayload = {
  name: string
  scope: PublishCornerScope
  hostAlias: string
  internalContact: string
  rules?: string
  schedule?: string
  location: PublishCornerLocationPayload
  consent: boolean
  photo: PublishCornerPhoto
  status: PublishCornerStatus
  draft: boolean
}

export type PublishCornerResponse = {
  id: string
  name: string
  imageUrl: string
  status: PublishCornerStatus
  locationSummary: string
}

export type CommunityCornerDetail = {
  id: string
  name: string
  scope: PublishCornerScope
  hostAlias: string
  rules: string | null
  schedule: string | null
  status: PublishCornerStatus
  visibilityPreference: PublishCornerVisibilityPreference
  imageUrl: string | null
  isOwner: boolean
  location: {
    city: string
    neighborhood: string
    referencePointLabel: string
    latitude: number
    longitude: number
    approximate: true
  }
  activity: {
    totalExchanges: number
    weeklyExchanges: number
    lastActivityAt: string | null
  }
}

export type UpdateCornerPayload = Partial<{
  name: string
  rules: string | null
  schedule: string | null
  status: PublishCornerStatus
  visibilityPreference: PublishCornerVisibilityPreference
}>
