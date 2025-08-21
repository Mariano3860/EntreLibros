import { faker } from '@faker-js/faker'

import { ApiUserBook } from '@src/api/books/userBooks.types'

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

const randomColor = () =>
  faker.number.int({ min: 0, max: 0xffffff }).toString(16).padStart(6, '0')

const coverFromTitle = (title: string) => {
  const bg = randomColor()
  const fg = randomColor()
  return `https://placehold.co/400x600/${bg}/${fg}?text=${encodeURIComponent(title)}`
}

export const generateUserBooks = (): ApiUserBook[] => {
  faker.seed(202)
  return [
    {
      id: faker.string.uuid(),
      title: 'Matisse en Bélgica',
      author: 'Carlos Argan',
      coverUrl: coverFromTitle('Matisse en Bélgica'),
      condition: 'bueno',
      status: 'available',
      isForSale: true,
      price: faker.number.int({ min: 10000, max: 20000 }),
    },
    {
      id: faker.string.uuid(),
      title: '1984',
      author: 'George Orwell',
      coverUrl: coverFromIsbn('9780451524935'),
      condition: 'muy bueno',
      status: 'reserved',
      isForTrade: true,
      tradePreferences: ['Dune', 'Fahrenheit 451'],
    },
    {
      id: faker.string.uuid(),
      title: 'El cuervo',
      author: 'Edgar Allan Poe',
      coverUrl: coverFromTitle('El cuervo'),
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
      coverUrl: coverFromTitle('El pulpo invisible'),
      isSeeking: true,
    },
    {
      id: faker.string.uuid(),
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      coverUrl: coverFromIsbn('9780062316097'),
      condition: 'nuevo',
      status: 'exchanged',
      isForTrade: true,
      tradePreferences: ['Homo Deus'],
    },
  ]
}
