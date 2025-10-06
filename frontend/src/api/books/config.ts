const RAW_MODE = (import.meta.env.PUBLIC_BOOKS_API_MODE || '').toLowerCase()

export type BooksApiMode = 'mock' | 'live'

const isValidMode = (value: string): value is BooksApiMode =>
  value === 'mock' || value === 'live'

export const BOOKS_API_MODE: BooksApiMode = isValidMode(RAW_MODE)
  ? RAW_MODE
  : 'mock'

export const resolveBooksPath = (path: string): string => {
  if (!path.startsWith('/')) {
    return resolveBooksPath(`/${path}`)
  }

  if (BOOKS_API_MODE === 'mock') {
    return `/api${path}`
  }

  return path
}
