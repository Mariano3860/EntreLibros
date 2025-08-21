import { faker } from '@faker-js/faker'

import { ApiBook } from '@src/api/books/books.types'

interface BookData {
  author: string
  isbn: string
  titles: { en: string; es: string }
}

const BOOKS: BookData[] = [
  {
    author: 'George Orwell',
    isbn: '9780451524935',
    titles: { en: '1984', es: '1984' },
  },
  {
    author: 'Gabriel García Márquez',
    isbn: '9788437604947',
    titles: {
      en: 'One Hundred Years of Solitude',
      es: 'Cien años de soledad',
    },
  },
  {
    author: 'J.K. Rowling',
    isbn: '9788478884452',
    titles: {
      en: "Harry Potter and the Philosopher's Stone",
      es: 'Harry Potter y la piedra filosofal',
    },
  },
  {
    author: 'Fyodor Dostoevsky',
    isbn: '9780140449136',
    titles: { en: 'Crime and Punishment', es: 'Crimen y castigo' },
  },
  {
    author: 'Harper Lee',
    isbn: '9780061120084',
    titles: { en: 'To Kill a Mockingbird', es: 'Matar un ruiseñor' },
  },
  {
    author: 'J.R.R. Tolkien',
    isbn: '9780547928227',
    titles: { en: 'The Hobbit', es: 'El Hobbit' },
  },
]

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

export const generateBooks = (
  seed?: number,
  language: string = 'es'
): ApiBook[] => {
  faker.seed(seed ?? 201)
  return faker.helpers
    .arrayElements(BOOKS, 3)
    .map(({ titles, author, isbn }) => ({
      title: titles[language as 'en' | 'es'] || titles.es,
      author,
      coverUrl: coverFromIsbn(isbn),
    }))
}
