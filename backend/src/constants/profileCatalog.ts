export const PROFILE_INTERESTS = [
  'fiction',
  'fantasy',
  'science-fiction',
  'history',
  'romance',
  'children',
  'essay',
  'poetry',
] as const;

export type ProfileInterest = (typeof PROFILE_INTERESTS)[number];

export const PROFILE_COUNTRIES = ['Argentina'] as const;

export type ProfileCountry = (typeof PROFILE_COUNTRIES)[number];

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
} as const;

export type ProfileCity = keyof typeof PROFILE_LOCATIONS;

export const isProfileInterest = (value: unknown): value is ProfileInterest =>
  typeof value === 'string' &&
  (PROFILE_INTERESTS as readonly string[]).includes(value);

export const isProfileCountry = (value: unknown): value is ProfileCountry =>
  typeof value === 'string' &&
  (PROFILE_COUNTRIES as readonly string[]).includes(value);

export const isProfileCity = (value: unknown): value is ProfileCity =>
  typeof value === 'string' && value in PROFILE_LOCATIONS;

export const isProfileNeighborhood = (
  city: ProfileCity,
  neighborhood: unknown
): neighborhood is (typeof PROFILE_LOCATIONS)[ProfileCity][number] =>
  typeof neighborhood === 'string' &&
  (PROFILE_LOCATIONS[city] as readonly string[]).includes(neighborhood);
