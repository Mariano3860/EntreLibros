import { query } from '../db.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_USER_LANGUAGE, DEFAULT_USER_ROLE } from '../constants.js';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  language: string;
}

export type PublicUser = Omit<User, 'password'>;

export function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  void password;
  return publicUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role = DEFAULT_USER_ROLE,
  language = DEFAULT_USER_LANGUAGE
): Promise<User> {
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query<User>(
    'INSERT INTO users (name, email, password, role, language) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, hashed, role, language]
  );
  return rows[0];
}

export async function updateUserLanguage(
  id: number,
  language: string
): Promise<User> {
  const { rows } = await query<User>(
    'UPDATE users SET language = $1 WHERE id = $2 RETURNING *',
    [language, id]
  );
  return rows[0];
}
