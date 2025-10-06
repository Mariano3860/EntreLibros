import { faker } from '@faker-js/faker'

import { ApiUserBook } from '@src/api/books/userBooks.types'

import { publicationStore } from './publications.faker'

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

const randomColor = () =>
  faker.number.int({ min: 0, max: 0xffffff }).toString(16).padStart(6, '0')

const coverFromTitle = (title: string) => {
  const bg = randomColor()
  const fg = randomColor()
  return `https://placehold.co/400x600/${bg}/${fg}?text=${encodeURIComponent(title)}`
}

const USER_BOOKS = [
  {
    title: 'Matisse en Bélgica',
    author: 'Carlos Argan',
    condition: 'bueno',
    status: 'available',
    isForSale: true,
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    condition: 'muy bueno',
    status: 'reserved',
    isForTrade: true,
    tradePreferences: ['Dune', 'Fahrenheit 451'],
  },
  {
    title: 'El cuervo',
    author: 'Edgar Allan Poe',
    condition: 'aceptable',
    status: 'sold',
    isForSale: true,
    isForTrade: true,
    tradePreferences: ['Lovecraft', 'Drácula', 'Sherlock Holmes'],
  },
  {
    title: 'El pulpo invisible',
    author: 'A. G. Rivadera',
    isSeeking: true,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    condition: 'nuevo',
    status: 'exchanged',
    isForTrade: true,
    tradePreferences: ['Homo Deus'],
  },
  {
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    isbn: '9788426104587',
    condition: 'bueno',
    status: 'available',
    isForTrade: true,
    tradePreferences: ['La sombra del viento'],
  },
  {
    title: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    isbn: '9780156013987',
    condition: 'nuevo',
    status: 'available',
    isForSale: true,
  },
]

export const generateUserBooks = (seed?: number): ApiUserBook[] => {
  faker.seed(seed ?? 202)
  const [first, second, ...rest] = USER_BOOKS
  const others = faker.helpers.arrayElements(rest, 3)
  const statusMap: Record<string, 'available' | 'reserved' | 'completed'> = {
    available: 'available',
    reserved: 'reserved',
    sold: 'completed',
    exchanged: 'completed',
  }

  const books = [first, second, ...others].map((b) => ({
    ...b,
    id: faker.string.uuid(),
    coverUrl: b.isbn ? coverFromIsbn(b.isbn) : coverFromTitle(b.title),
    price: b.isForSale
      ? faker.number.int({ min: 8000, max: 20000 })
      : undefined,
  })) as ApiUserBook[]

  books.forEach((book) => {
    const mappedStatus = statusMap[book.status ?? 'available'] ?? 'available'
    publicationStore.seedFromPreview(book.id, {
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      status: mappedStatus,
      isOwner: true,
    })
  })

  return books
}
