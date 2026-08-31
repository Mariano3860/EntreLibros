import type { ApiUserBook } from '@src/api/books/userBooks.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'

export const generateUserBooks = (seed?: number): ApiUserBook[] => {
  void seed
  return prototypeCatalog.books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: `/prototype/book-cover.svg?book=${book.id}`,
    condition: 'muy bueno',
    status: 'available',
    isForTrade: book.mode === 'Intercambio',
    isForSale: book.mode === 'Venta',
    price: book.price ? Number(book.price.replace(/\D/g, '')) : undefined,
  }))
}
