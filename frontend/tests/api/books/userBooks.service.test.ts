import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { fetchUserBooks } from '@src/api/books/userBooks.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchUserBooks service', () => {
  test('returns list of user books', async () => {
    const books = await fetchUserBooks()
    expect(books).toHaveLength(5)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.MINE), () =>
        HttpResponse.json({ not: 'an array' })
      )
    )
    await expect(fetchUserBooks()).rejects.toThrow('Invalid books response')
  })
})
