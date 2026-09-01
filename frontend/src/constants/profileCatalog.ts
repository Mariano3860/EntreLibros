import type { ProfileInterest } from '@src/api/user/profile.types'
import type { ProfileCountry } from '@src/api/user/profile.types'

export const PROFILE_COUNTRIES: readonly ProfileCountry[] = ['Argentina']

export const PROFILE_INTERESTS: readonly ProfileInterest[] = [
  'fiction',
  'fantasy',
  'science-fiction',
  'history',
  'romance',
  'children',
  'essay',
  'poetry',
]

export const PROFILE_LOCATIONS = {
  'Buenos Aires': [
    'Palermo',
    'Chacarita',
    'Villa Crespo',
    'Caballito',
    'Almagro',
    'Parque Patricios',
    'Barracas',
    'Colegiales',
  ],
  'La Plata': ['Tolosa'],
} as const

export type ProfileCity = keyof typeof PROFILE_LOCATIONS
