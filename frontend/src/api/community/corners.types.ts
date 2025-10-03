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
