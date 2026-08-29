export type ProfileVisibility = 'public' | 'private'
export type LocationVisibility = 'private' | 'city' | 'neighborhood'

export type UserProfile = {
  id: number
  name: string
  alias: string
  email: string
  language: string
  profileDescription: string | null
  profileVisibility: ProfileVisibility
  locationVisibility: LocationVisibility
  location: { latitude: number; longitude: number } | null
}

export type PublicProfile = {
  id: number
  alias: string
  profileDescription: string | null
  language: string
  location: { latitude: number; longitude: number } | null
}

export type UpdateProfileRequest = {
  alias: string
  description: string | null
  profileVisibility: ProfileVisibility
  locationVisibility: LocationVisibility
  language: string
}
