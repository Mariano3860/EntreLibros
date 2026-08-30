/**
 * Representa un libro tal como se recibe desde la API.
 * TODO: extender con más metadatos del libro.
 */
import type { ApiUserBook } from './userBooks.types'

/** Public catalog listing returned by `/api/books`. */
export type ApiBook = ApiUserBook
