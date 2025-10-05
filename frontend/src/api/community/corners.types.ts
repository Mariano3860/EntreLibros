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

export type PublishCornerVisibility = 'neighborhood' | 'city'

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
  location: {
    country: string
    province: string
    city: string
    neighborhood: string
    reference: string
    visibility: PublishCornerVisibility
  }
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
