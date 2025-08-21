import { faker } from '@faker-js/faker'

import { ApiUserBook } from '@src/api/books/userBooks.types'

export const generateUserBooks = (): ApiUserBook[] => {
  faker.seed(202)
  return [
    {
      id: faker.string.uuid(),
      title: 'Matisse en Bélgica',
      author: 'Carlos Argan',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      condition: 'bueno',
      status: 'available',
      isForSale: true,
      price: faker.number.int({ min: 10000, max: 20000 }),
    },
    {
      id: faker.string.uuid(),
      title: '1984',
      author: 'George Orwell',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      condition: 'muy bueno',
      status: 'reserved',
      isForTrade: true,
      tradePreferences: ['Dune', 'Fahrenheit 451'],
    },
    {
      id: faker.string.uuid(),
      title: 'El cuervo',
      author: 'Edgar Allan Poe',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      condition: 'aceptable',
      status: 'sold',
      isForSale: true,
      price: faker.number.int({ min: 10000, max: 20000 }),
      isForTrade: true,
      tradePreferences: ['Lovecraft', 'Drácula', 'Sherlock Holmes'],
    },
    {
      id: faker.string.uuid(),
      title: 'El pulpo invisible',
      author: 'A. G. Rivadera',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      isSeeking: true,
    },
    {
      id: faker.string.uuid(),
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      condition: 'nuevo',
      status: 'exchanged',
      isForTrade: true,
      tradePreferences: ['Homo Deus'],
    },
  ]
}
