import type { ApiBook } from '@src/api/books/books.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'

export const generateBooks = (seed?: number, language = 'es'): ApiBook[] => {
  void seed
  void language
  return prototypeCatalog.books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: `/prototype/book-cover.svg?book=${book.id}`,
    condition: 'muy bueno',
    status: 'available',
    isForTrade: book.mode === 'Intercambio',
    isForSale: book.mode === 'Venta',
    isSeeking: book.mode === 'Buscado',
    price: book.price ? Number(book.price.replace(/\D/g, '')) : undefined,
  }))
}
