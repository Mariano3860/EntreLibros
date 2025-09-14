import { query } from '../db.js';

export interface Book {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  published_year: number | null;
  publisher: string | null;
  verified: boolean;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  publishedYear?: number;
  publisher?: string;
}

export async function createBook({
  title,
  author,
  isbn,
  publishedYear,
  publisher,
}: CreateBookInput): Promise<Book> {
  const autoVerified = isbn ? /^\d{13}$/.test(isbn) : false;
  const { rows } = await query<Book>(
    `INSERT INTO books (title, author, isbn, published_year, publisher, verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      title,
      author,
      isbn ?? null,
      publishedYear ?? null,
      publisher ?? null,
      autoVerified,
    ]
  );
  return rows[0];
}

export async function listBooks(): Promise<Book[]> {
  const { rows } = await query<Book>(
    'SELECT * FROM books WHERE verified = true ORDER BY id'
  );
  return rows;
}

export async function searchBooks(queryText: string): Promise<Book[]> {
  const { rows } = await query<Book>(
    `SELECT * FROM books
     WHERE verified = true AND (title ILIKE $1 OR author ILIKE $1)
     ORDER BY id`,
    [`%${queryText}%`]
  );
  return rows;
}

export async function verifyBook(id: number): Promise<Book | null> {
  const { rows } = await query<Book>(
    'UPDATE books SET verified = true WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] ?? null;
}
