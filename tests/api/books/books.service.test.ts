import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { fetchBooks } from '@src/api/books/books.service'
import { server } from '@mocks/server'

describe('fetchBooks service', () => {
  test('returns list of books', async () => {
    const books = await fetchBooks()
    expect(books).toHaveLength(3)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(RELATIVE_API_ROUTES.BOOKS.LIST, () =>
        HttpResponse.json({ not: 'an array' })
      )
    )
    await expect(fetchBooks()).rejects.toThrow('Invalid books response')
  })
})
