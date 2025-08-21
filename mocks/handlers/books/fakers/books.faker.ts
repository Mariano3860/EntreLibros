import { faker } from '@faker-js/faker'

import { ApiBook } from '@src/api/books/books.types'

const BOOKS = [
  { title: '1984', author: 'George Orwell', isbn: '9780451524935' },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '9780060850524' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '9781451673319' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488' },
]

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

export const generateBooks = (): ApiBook[] => {
  faker.seed(201)
  return faker.helpers
    .arrayElements(BOOKS, 3)
    .map(({ title, author, isbn }) => ({
      title,
      author,
      coverUrl: coverFromIsbn(isbn),
    }))
}

