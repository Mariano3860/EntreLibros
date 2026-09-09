import type { ApiBook } from '@src/api/books/books.types'
import { mockExperienceFixtures } from '@src/mocks/fixtures/experience'

export const generateBooks = (seed?: number, language = 'es'): ApiBook[] => {
  void seed
  void language
  return mockExperienceFixtures.books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: `/illustrations/book-cover.svg?book=${book.id}`,
    condition: 'muy bueno',
    status: 'available',
    isForTrade: book.mode === 'Intercambio',
    isForSale: book.mode === 'Venta',
    isSeeking: book.mode === 'Buscado',
    price: book.price ? Number(book.price.replace(/\D/g, '')) : undefined,
  }))
}
