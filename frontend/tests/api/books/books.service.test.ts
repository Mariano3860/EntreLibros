import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  fetchAllBooks,
  fetchBooks,
  fetchHomeBooks,
} from '@src/api/books/books.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchBooks service', () => {
  test('returns list of books', async () => {
    const books = await fetchBooks()
    expect(books).toHaveLength(5)
  })

  test('returns the paginated Todos catalog', async () => {
    const page = await fetchAllBooks({ limit: 2, offset: 2 })

    expect(page.items).toHaveLength(2)
    expect(page.page).toEqual({
      limit: 2,
      offset: 2,
      total: 5,
      hasNext: true,
      hasPrevious: true,
    })
  })

  test('adds the authenticated own source once to the mock catalog', async () => {
    document.cookie = 'sessionToken=mock-session; path=/'

    const page = await fetchAllBooks({ limit: 100 })

    expect(page.page.total).toBe(6)
    expect(page.items.map((book) => book.id)).toContain('mariano-libro')
    expect(new Set(page.items.map((book) => book.id)).size).toBe(6)
  })

  test('returns the home book rail', async () => {
    const books = await fetchHomeBooks()
    expect(books.items).toHaveLength(5)
    expect(books.page).toEqual({
      limit: 5,
      offset: 0,
      hasNext: false,
      hasPrevious: false,
    })
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST), () =>
        HttpResponse.json({ not: 'an array' })
      )
    )
    await expect(fetchBooks()).rejects.toThrow('Invalid books response')
  })

  test('throws when the Todos response is not paginated', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST), () =>
        HttpResponse.json({ items: [] })
      )
    )

    await expect(fetchAllBooks()).rejects.toThrow('Invalid books response')
  })
})
