import { query } from '../db.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_USER_LANGUAGE, DEFAULT_USER_ROLE } from '../constants.js';
import type {
  ProfileCountry,
  ProfileInterest,
  ProfileCity,
} from '../constants/profileCatalog.js';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  language: string;
  longitude: number | null;
  latitude: number | null;
  search_radius: number | null;
  alias: string | null;
  profile_description: string | null;
  profile_photo_url: string | null;
  profile_visibility: 'public' | 'private' | null;
  location_visibility: 'none' | 'country' | 'city' | 'neighborhood' | null;
  interests: ProfileInterest[];
  country: ProfileCountry | null;
  city: ProfileCity | null;
  neighborhood: string | null;
  street: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  language: string;
  location: { latitude: number; longitude: number } | null;
  searchRadius: number | null;
  alias?: string;
  profileDescription?: string | null;
  profilePhoto: string | null;
  profileVisibility?: 'public' | 'private';
  locationVisibility?: 'none' | 'country' | 'city' | 'neighborhood';
  interests: ProfileInterest[];
  country: ProfileCountry | null;
  city: ProfileCity | null;
  neighborhood: string | null;
  street: string | null;
}

function rowToUser(row: UserRow): User {
  const {
    longitude,
    latitude,
    search_radius,
    alias,
    profile_description,
    profile_photo_url,
    profile_visibility,
    location_visibility,
    interests,
    country,
    city,
    neighborhood,
    street,
    ...rest
  } = row;
  return {
    ...rest,
    alias: alias ?? rest.name,
    profileDescription: profile_description,
    profilePhoto: profile_photo_url,
    profileVisibility: profile_visibility ?? 'public',
    locationVisibility: location_visibility ?? 'city',
    interests: interests ?? [],
    country,
    city,
    neighborhood,
    street,
    location:
      longitude !== null && latitude !== null ? { latitude, longitude } : null,
    searchRadius: search_radius,
  };
}

export type PublicUser = Omit<User, 'password'>;

export type PublicProfile = {
  id: number;
  alias: string;
  profileDescription: string | null;
  profilePhoto: string | null;
  language: string;
  location: { latitude: number; longitude: number } | null;
  interests: ProfileInterest[];
  country?: ProfileCountry;
  city?: ProfileCity;
  neighborhood?: string;
};

export function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  void password;
  return publicUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query<UserRow>(
    'SELECT *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude FROM users WHERE email = $1',
    [email]
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function findUserById(id: number): Promise<User | null> {
  const { rows } = await query<UserRow>(
    'SELECT *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role = DEFAULT_USER_ROLE,
  language = DEFAULT_USER_LANGUAGE
): Promise<User> {
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query<UserRow>(
    'INSERT INTO users (name, alias, email, password, role, language) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude',
    [name, name, email, hashed, role, language]
  );
  return rowToUser(rows[0]);
}

export async function updateUserLanguage(
  id: number,
  language: string
): Promise<User> {
  const { rows } = await query<UserRow>(
    'UPDATE users SET language = $1 WHERE id = $2 RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude',
    [language, id]
  );
  return rowToUser(rows[0]);
}

export async function updateUserLocation(
  id: number,
  longitude: number,
  latitude: number,
  searchRadius: number
): Promise<User> {
  const { rows } = await query<UserRow>(
    'UPDATE users SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, search_radius = $3 WHERE id = $4 RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude',
    [longitude, latitude, searchRadius, id]
  );
  return rowToUser(rows[0]);
}

export type UserProfileUpdate = {
  alias?: string;
  profileDescription?: string | null;
  profilePhoto?: string | null;
  profileVisibility?: 'public' | 'private';
  locationVisibility?: 'none' | 'country' | 'city' | 'neighborhood';
  language?: string;
  interests?: ProfileInterest[];
  country?: ProfileCountry;
  city?: ProfileCity | null;
  neighborhood?: string | null;
  street?: string | null;
};

export async function updateUserProfile(
  id: number,
  updates: UserProfileUpdate
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;
  const mapping: Array<[keyof UserProfileUpdate, string]> = [
    ['alias', 'alias'],
    ['profileDescription', 'profile_description'],
    ['profilePhoto', 'profile_photo_url'],
    ['profileVisibility', 'profile_visibility'],
    ['locationVisibility', 'location_visibility'],
    ['language', 'language'],
    ['interests', 'interests'],
    ['country', 'country'],
    ['city', 'city'],
    ['neighborhood', 'neighborhood'],
    ['street', 'street'],
  ];
  for (const [key, column] of mapping) {
    const value = updates[key];
    if (value !== undefined) {
      fields.push(`${column} = $${index++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) {
    return findUserById(id);
  }
  values.push(id);
  const { rows } = await query<UserRow>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${index}
     RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude`,
    values
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

function roundLocation(
  location: User['location'],
  visibility: NonNullable<User['locationVisibility']>
): User['location'] {
  if (!location || visibility === 'none') {
    return null;
  }
  const digits = visibility === 'country' ? 1 : visibility === 'city' ? 2 : 3;
  const factor = 10 ** digits;
  return {
    latitude: Math.round(location.latitude * factor) / factor,
    longitude: Math.round(location.longitude * factor) / factor,
  };
}

export async function findPublicProfileById(
  id: number
): Promise<PublicProfile | null> {
  const user = await findUserById(id);
  if (!user || user.profileVisibility === 'private') {
    return null;
  }
  const locationVisibility = user.locationVisibility ?? 'city';
  return {
    id: user.id,
    alias: user.alias ?? user.name,
    profileDescription: user.profileDescription ?? null,
    profilePhoto: user.profilePhoto,
    language: user.language,
    location: roundLocation(user.location, locationVisibility),
    interests: user.interests,
    ...(locationVisibility !== 'none' && user.country
      ? { country: user.country }
      : {}),
    ...((locationVisibility === 'city' ||
      locationVisibility === 'neighborhood') &&
    user.city
      ? { city: user.city }
      : {}),
    ...(locationVisibility === 'neighborhood' && user.neighborhood
      ? { neighborhood: user.neighborhood }
      : {}),
  };
}

export async function createUserBlock(
  blockerId: number,
  blockedId: number
): Promise<void> {
  await query(
    `INSERT INTO user_blocks (blocker_id, blocked_id)
     VALUES ($1, $2)
     ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
    [blockerId, blockedId]
  );
}

export async function deleteUserBlock(
  blockerId: number,
  blockedId: number
): Promise<void> {
  await query(
    'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
    [blockerId, blockedId]
  );
}

export async function hasUserBlock(
  blockerId: number,
  blockedId: number
): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM user_blocks
       WHERE blocker_id = $1 AND blocked_id = $2
     ) AS exists`,
    [blockerId, blockedId]
  );
  return rows[0]?.exists ?? false;
}
