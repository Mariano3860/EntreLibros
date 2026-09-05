import type { ApiUserBook } from '@src/api/books/userBooks.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'
import type { PrototypeBook } from '@src/features/prototype/catalog'

export const generateUserBooks = (seed?: number): ApiUserBook[] => {
  void seed
  const sourceBooks: readonly PrototypeBook[] = prototypeCatalog.userBooks
  return sourceBooks.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: `/prototype/book-cover.svg?book=${book.id}`,
    condition: 'muy bueno',
    status: 'available',
    type: book.mode === 'Buscado' ? ('want' as const) : ('offer' as const),
    isForTrade: book.mode === 'Intercambio',
    isForSale: book.mode === 'Venta',
    isSeeking: book.mode === 'Buscado',
    price: book.price ? Number(book.price.replace(/\D/g, '')) : undefined,
  }))
}
