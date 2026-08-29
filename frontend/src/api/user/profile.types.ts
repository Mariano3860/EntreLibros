export type ProfileVisibility = 'public' | 'private'
export type LocationVisibility = 'private' | 'city' | 'neighborhood'
export type ProfileInterest =
  | 'fiction'
  | 'fantasy'
  | 'science-fiction'
  | 'history'
  | 'romance'
  | 'children'
  | 'essay'
  | 'poetry'

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
  interests: ProfileInterest[]
  city: string | null
  neighborhood: string | null
}

export type PublicProfile = {
  id: number
  alias: string
  profileDescription: string | null
  language: string
  location: { latitude: number; longitude: number } | null
  interests: ProfileInterest[]
  city?: string
  neighborhood?: string
}

export type UpdateProfileRequest = {
  alias: string
  description: string | null
  profileVisibility: ProfileVisibility
  locationVisibility: LocationVisibility
  language: string
  interests: ProfileInterest[]
  city: string
  neighborhood: string | null
}
