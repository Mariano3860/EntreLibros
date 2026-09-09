import type { ApiUserBook } from '@src/api/books/userBooks.types'
import { mockExperienceFixtures } from '@src/mocks/fixtures/experience'
import type { BookCardView } from '@src/shared/view-models/types'

export const generateUserBooks = (seed?: number): ApiUserBook[] => {
  void seed
  const sourceBooks: readonly BookCardView[] = mockExperienceFixtures.userBooks
  return sourceBooks.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: `/illustrations/book-cover.svg?book=${book.id}`,
    condition: 'muy bueno',
    status: 'available',
    type: book.mode === 'Buscado' ? ('want' as const) : ('offer' as const),
    isForTrade: book.mode === 'Intercambio',
    isForSale: book.mode === 'Venta',
    isSeeking: book.mode === 'Buscado',
    price: book.price ? Number(book.price.replace(/\D/g, '')) : undefined,
  }))
}
