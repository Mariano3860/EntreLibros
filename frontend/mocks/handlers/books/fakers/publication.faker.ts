import { faker } from '@faker-js/faker'

import {
  Publication,
  PublicationStatus,
} from '@src/api/books/publication.types'

const BOOK_DATA = [
  {
    id: '1',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    publisher: 'Signet Classics',
    year: 1949,
    language: 'English',
    format: 'Paperback',
  },
  {
    id: '2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '9788437604947',
    publisher: 'Editorial Sudamericana',
    year: 1967,
    language: 'Spanish',
    format: 'Paperback',
  },
  {
    id: '3',
    title: 'Harry Potter y la piedra filosofal',
    author: 'J.K. Rowling',
    isbn: '9788478884452',
    publisher: 'Salamandra',
    year: 1997,
    language: 'Spanish',
    format: 'Hardcover',
  },
]

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

export const generatePublication = (id: string): Publication => {
  const bookData = BOOK_DATA.find((b) => b.id === id)
  const conditions = ['new', 'very_good', 'good', 'acceptable'] as const
  const statuses: PublicationStatus[] = [
    'available',
    'reserved',
    'completed',
    'draft',
  ]

  faker.seed(parseInt(id) || 1)

  // Use predefined data if available, otherwise generate random data
  if (bookData) {
    return {
      id,
      title: bookData.title,
      author: bookData.author,
      coverUrl: coverFromIsbn(bookData.isbn),
      publisher: bookData.publisher,
      year: bookData.year,
      language: bookData.language,
      format: bookData.format,
      isbn: bookData.isbn,
      condition: faker.helpers.arrayElement(conditions),
      status: faker.helpers.arrayElement(statuses),
      notes: faker.lorem.paragraph(),
      images: [
        {
          id: '1',
          url: coverFromIsbn(bookData.isbn),
          source: 'cover' as const,
        },
        {
          id: '2',
          url: `https://picsum.photos/seed/${id}-1/300/450`,
          source: 'upload' as const,
        },
      ],
      offer: {
        sale: faker.datatype.boolean(),
        donation: faker.datatype.boolean(),
        trade: faker.datatype.boolean(),
        price: faker.datatype.boolean()
          ? {
              amount: faker.number.int({ min: 100, max: 5000 }),
              currency: 'ARS',
            }
          : null,
        tradePreferences: faker.helpers.arrayElements(
          ['fiction', 'nonfiction', 'fantasy', 'history'],
          2
        ),
        availability: faker.helpers.arrayElement([
          'public',
          'private',
        ] as const),
        delivery: {
          nearBookCorner: faker.datatype.boolean(),
          inPerson: faker.datatype.boolean(),
          shipping: faker.datatype.boolean(),
          shippingPayer: faker.helpers.arrayElement([
            'owner',
            'requester',
            'split',
          ] as const),
        },
      },
      cornerId: faker.datatype.boolean() ? faker.string.uuid() : null,
      ownerId: 'u_1',
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
      updatedAt: faker.date.recent({ days: 7 }).toISOString(),
    }
  }

  // Generate random data for unknown IDs
  const randomIsbn = `978${faker.string.numeric(10)}`
  return {
    id,
    title: faker.lorem.words(3),
    author: faker.person.fullName(),
    coverUrl: `https://picsum.photos/seed/${id}/300/450`,
    publisher: faker.company.name(),
    year: faker.number.int({ min: 1950, max: 2024 }),
    language: faker.helpers.arrayElement(['English', 'Spanish', 'French']),
    format: faker.helpers.arrayElement(['Paperback', 'Hardcover', 'Ebook']),
    isbn: randomIsbn,
    condition: faker.helpers.arrayElement(conditions),
    status: faker.helpers.arrayElement(statuses),
    notes: faker.lorem.paragraph(),
    images: [
      {
        id: '1',
        url: `https://picsum.photos/seed/${id}/300/450`,
        source: 'cover' as const,
      },
      {
        id: '2',
        url: `https://picsum.photos/seed/${id}-1/300/450`,
        source: 'upload' as const,
      },
    ],
    offer: {
      sale: faker.datatype.boolean(),
      donation: faker.datatype.boolean(),
      trade: faker.datatype.boolean(),
      price: faker.datatype.boolean()
        ? {
            amount: faker.number.int({ min: 100, max: 5000 }),
            currency: 'ARS',
          }
        : null,
      tradePreferences: faker.helpers.arrayElements(
        ['fiction', 'nonfiction', 'fantasy', 'history'],
        2
      ),
      availability: faker.helpers.arrayElement(['public', 'private'] as const),
      delivery: {
        nearBookCorner: faker.datatype.boolean(),
        inPerson: faker.datatype.boolean(),
        shipping: faker.datatype.boolean(),
        shippingPayer: faker.helpers.arrayElement([
          'owner',
          'requester',
          'split',
        ] as const),
      },
    },
    cornerId: faker.datatype.boolean() ? faker.string.uuid() : null,
    ownerId: 'u_1',
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  }
}
