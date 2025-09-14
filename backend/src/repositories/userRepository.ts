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
}

function rowToUser(row: UserRow): User {
  const { longitude, latitude, search_radius, ...rest } = row;
  return {
    ...rest,
    location:
      longitude !== null && latitude !== null ? { latitude, longitude } : null,
    searchRadius: search_radius,
  };
}

export type PublicUser = Omit<User, 'password'>;

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
    'INSERT INTO users (name, email, password, role, language) VALUES ($1, $2, $3, $4, $5) RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude',
    [name, email, hashed, role, language]
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
