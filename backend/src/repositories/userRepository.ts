import { query } from '../db.js';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0] ?? null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role = 'user'
): Promise<User> {
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query<User>(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashed, role]
  );
  return rows[0];
}
