import { query } from '../db.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_USER_LANGUAGE, DEFAULT_USER_ROLE } from '../constants.js';

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
  profile_visibility: 'public' | 'private' | null;
  location_visibility: 'private' | 'city' | 'neighborhood' | null;
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
  profileVisibility?: 'public' | 'private';
  locationVisibility?: 'private' | 'city' | 'neighborhood';
}

function rowToUser(row: UserRow): User {
  const {
    longitude,
    latitude,
    search_radius,
    alias,
    profile_description,
    profile_visibility,
    location_visibility,
    ...rest
  } = row;
  return {
    ...rest,
    alias: alias ?? rest.name,
    profileDescription: profile_description,
    profileVisibility: profile_visibility ?? 'public',
    locationVisibility: location_visibility ?? 'city',
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
  language: string;
  location: { latitude: number; longitude: number } | null;
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
  profileVisibility?: 'public' | 'private';
  locationVisibility?: 'private' | 'city' | 'neighborhood';
  language?: string;
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
    ['profileVisibility', 'profile_visibility'],
    ['locationVisibility', 'location_visibility'],
    ['language', 'language'],
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
  if (!location || visibility === 'private') {
    return null;
  }
  const digits = visibility === 'city' ? 2 : 3;
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
  return {
    id: user.id,
    alias: user.alias ?? user.name,
    profileDescription: user.profileDescription ?? null,
    language: user.language,
    location: roundLocation(user.location, user.locationVisibility ?? 'city'),
  };
}
