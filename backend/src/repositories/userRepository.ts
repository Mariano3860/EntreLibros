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
  publicationCount: number;
  exchangeCount: number;
  publications: Array<{
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    type: 'offer' | 'want';
  }>;
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
  const [publicationSummary, exchangeSummary, publicationsResult] =
    await Promise.all([
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM book_listings
         WHERE user_id = $1
           AND availability = 'public'
           AND is_draft = false
           AND status NOT IN ('completed', 'sold', 'exchanged', 'inactive')
           AND editorial_status = 'approved'
           AND (expires_at IS NULL OR expires_at > NOW())`,
        [id]
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM exchange_agreements
         WHERE state = 'completed'
           AND (proposer_id = $1 OR participant_id = $1)`,
        [id]
      ),
      query<{
        id: number;
        title: string;
        author: string | null;
        cover_url: string | null;
        type: 'offer' | 'want';
      }>(
        `SELECT p.id, b.title, b.author, COALESCE(img.url, b.cover_url) AS cover_url, p.type
         FROM book_listings p
         JOIN books b ON b.id = p.book_id
         LEFT JOIN LATERAL (
           SELECT url
           FROM book_listing_images
           WHERE book_listing_id = p.id
           ORDER BY is_primary DESC, id ASC
           LIMIT 1
         ) img ON true
         WHERE p.user_id = $1
           AND p.availability = 'public'
           AND p.is_draft = false
           AND p.status NOT IN ('completed', 'sold', 'exchanged', 'inactive')
           AND p.editorial_status = 'approved'
           AND (p.expires_at IS NULL OR p.expires_at > NOW())
         ORDER BY p.created_at DESC, p.id DESC
         LIMIT 12`,
        [id]
      ),
    ]);
  const locationVisibility = user.locationVisibility ?? 'city';
  return {
    id: user.id,
    alias: user.alias ?? user.name,
    profileDescription: user.profileDescription ?? null,
    profilePhoto: user.profilePhoto,
    language: user.language,
    location: roundLocation(user.location, locationVisibility),
    interests: user.interests,
    publicationCount: Number(publicationSummary.rows[0]?.count ?? 0),
    exchangeCount: Number(exchangeSummary.rows[0]?.count ?? 0),
    publications: publicationsResult.rows.map((publication) => ({
      id: String(publication.id),
      title: publication.title,
      author: publication.author,
      coverUrl: publication.cover_url,
      type: publication.type,
    })),
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
