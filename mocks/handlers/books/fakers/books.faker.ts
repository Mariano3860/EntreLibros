import { faker } from '@faker-js/faker'

import { ApiBook } from '@src/api/books/books.types'

export const generateBooks = (): ApiBook[] => {
  faker.seed(201)
  return [
    {
      title: '1984',
      author: 'George Orwell',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
    },
  ]
}
