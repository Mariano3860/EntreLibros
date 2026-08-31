import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { fetchBooks, fetchHomeBooks } from '@src/api/books/books.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchBooks service', () => {
  test('returns list of books', async () => {
    const books = await fetchBooks()
    expect(books).toHaveLength(5)
  })

  test('returns the home book rail', async () => {
    const books = await fetchHomeBooks()
    expect(books).toHaveLength(5)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST), () =>
        HttpResponse.json({ not: 'an array' })
      )
    )
    await expect(fetchBooks()).rejects.toThrow('Invalid books response')
  })
})
