import { faker } from '@faker-js/faker'

import { ApiBook } from '@src/api/books/books.types'

const BOOKS = [
  { title: '1984', author: 'George Orwell', isbn: '9780451524935' },
  { title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '9788437604947' },
  { title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', isbn: '9780156013987' },
  { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', isbn: '9788426104587' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518' },
  { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', isbn: '9788408172175' },
  { title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', isbn: '9780307389732' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227' },
  { title: 'Moby-Dick', author: 'Herman Melville', isbn: '9780142437247' },
  { title: 'El nombre de la rosa', author: 'Umberto Eco', isbn: '9780156001311' },
  { title: 'Les Misérables', author: 'Victor Hugo', isbn: '9782070409185' },
  { title: 'The Odyssey', author: 'Homer', isbn: '9780140268867' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595' },
  { title: 'La peste', author: 'Albert Camus', isbn: '9782070360424' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '9780140449136' },
  { title: 'Harry Potter y la piedra filosofal', author: 'J.K. Rowling', isbn: '9788478884452' },
  { title: 'El alquimista', author: 'Paulo Coelho', isbn: '9780061122415' },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', isbn: '9781594631931' },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780544003415' },
]

const coverFromIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

export const generateBooks = (seed?: number): ApiBook[] => {
  faker.seed(seed ?? 201)
  return faker.helpers
    .arrayElements(BOOKS, 3)
    .map(({ title, author, isbn }) => ({
      title,
      author,
      coverUrl: coverFromIsbn(isbn),
    }))
}

