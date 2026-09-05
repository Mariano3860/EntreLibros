/**
 * Representa un libro tal como se recibe desde la API.
 * TODO: extender con más metadatos del libro.
 */
import type { ApiUserBook } from './userBooks.types'

/** Public catalog listing returned by `/api/books`. */
export type ApiBook = ApiUserBook

export type ApiBookCatalogPage = {
  items: ApiBook[]
  page: {
    limit: number
    offset: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/** Página de recomendaciones públicas retornada por `/api/books/home`. */
export type ApiHomeBooksPage = {
  items: ApiBook[]
  page: {
    limit: number
    offset: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
