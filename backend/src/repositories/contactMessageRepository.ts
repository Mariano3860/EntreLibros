import { query } from '../db.js';

interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ROW_TO_ENTITY_FIELDS = `
  id,
  name,
  email,
  message,
  created_at,
  updated_at
`;

function rowToEntity(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export async function createContactMessage(
  input: CreateContactMessageInput
): Promise<ContactMessage> {
  const { name, email, message } = input;
  const { rows } = await query<ContactMessageRow>(
    `INSERT INTO contact_messages (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING ${ROW_TO_ENTITY_FIELDS}`,
    [name, email, message]
  );

  const row = rows[0];

  if (!row) {
    throw new Error('contact.repository.insert_failed');
  }

  return rowToEntity(row);
}
