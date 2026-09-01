export type ProfileVisibility = 'public' | 'private'
export type LocationVisibility = 'none' | 'country' | 'city' | 'neighborhood'
export type ProfileCountry = 'Argentina'
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
  profilePhoto: string | null
  profileVisibility: ProfileVisibility
  locationVisibility: LocationVisibility
  location: { latitude: number; longitude: number } | null
  interests: ProfileInterest[]
  country: ProfileCountry | null
  city: string | null
  neighborhood: string | null
  street: string | null
}

export type PublicProfile = {
  id: number
  alias: string
  profileDescription: string | null
  profilePhoto: string | null
  language: string
  location: { latitude: number; longitude: number } | null
  interests: ProfileInterest[]
  country?: ProfileCountry
  city?: string
  neighborhood?: string
}

export type UpdateProfileRequest = {
  alias: string
  description: string | null
  profilePhoto: string | null
  profileVisibility: ProfileVisibility
  locationVisibility: LocationVisibility
  language: string
  interests: ProfileInterest[]
  country: ProfileCountry
  city: string | null
  neighborhood: string | null
  street: string | null
}
