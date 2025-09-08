import { query } from '../db.js'

export interface Book {
  id: number
  title: string
}

export async function createBook(title: string): Promise<Book> {
  const { rows } = await query<Book>(
    'INSERT INTO books (title) VALUES ($1) RETURNING *',
    [title]
  )
  return rows[0]
}

export async function listBooks(): Promise<Book[]> {
  const { rows } = await query<Book>('SELECT * FROM books ORDER BY id')
  return rows
}
