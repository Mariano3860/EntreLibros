import { query } from '../db.js';

interface BookRow {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  published_year: number | null;
  verified: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
  verified: boolean;
}

function rowToBook(row: BookRow): Book {
  const { published_year, ...rest } = row;
  return { ...rest, publishedYear: published_year };
}

export interface NewBook {
  title: string;
  author?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  verified?: boolean;
}

export async function createBook(book: NewBook): Promise<Book> {
  const {
    title,
    author,
    isbn,
    publisher,
    publishedYear,
    verified = false,
  } = book;
  const { rows } = await query<BookRow>(
    'INSERT INTO books (title, author, isbn, publisher, published_year, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      title,
      author ?? null,
      isbn ?? null,
      publisher ?? null,
      publishedYear ?? null,
      verified,
    ]
  );
  return rowToBook(rows[0]);
}

export async function listBooks(): Promise<Book[]> {
  const { rows } = await query<BookRow>('SELECT * FROM books ORDER BY id');
  return rows.map(rowToBook);
}

export async function verifyBook(id: number): Promise<Book | null> {
  const { rows } = await query<BookRow>(
    'UPDATE books SET verified = true WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] ? rowToBook(rows[0]) : null;
}
