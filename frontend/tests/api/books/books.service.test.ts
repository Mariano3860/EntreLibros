import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  fetchPublicBookCatalog,
  fetchBookRelations,
  fetchBooks,
  fetchHomeBooks,
} from '@src/api/books/books.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchBooks service', () => {
  test('returns list of books', async () => {
    const books = await fetchBooks()
    expect(books).toHaveLength(5)
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

  test('returns only personal relations with category counts', async () => {
    const page = await fetchBookRelations({ tab: 'all', limit: 100 })

    expect(page.items).toHaveLength(9)
    expect(page.page.total).toBe(9)
    expect(page.counts).toEqual({ all: 9, trade: 3, sale: 2, seeking: 4 })
    expect(page.items.every((book) => book.ownerId === '1')).toBe(true)
  })

  test('returns the paginated public catalog with the all scope', async () => {
    server.use(
      http.get(
        apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST),
        ({ request }) => {
          const searchParams = new URL(request.url).searchParams
          expect(searchParams.get('scope')).toBe('all')
          expect(searchParams.get('q')).toBe('Dune')
          return HttpResponse.json({
            items: [
              {
                id: 'public-1',
                title: 'Dune',
                author: 'Frank Herbert',
                coverUrl: '',
                ownerId: '2',
                ownerName: 'Otra lectora',
              },
            ],
            page: {
              limit: 5,
              offset: 0,
              total: 1,
              hasNext: false,
              hasPrevious: false,
            },
          })
        }
      )
    )

    const page = await fetchPublicBookCatalog({ q: 'Dune', limit: 5 })

    expect(page.items[0]).toMatchObject({
      id: 'public-1',
      ownerId: '2',
      ownerName: 'Otra lectora',
    })
    expect(page.page.total).toBe(1)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST), () =>
        HttpResponse.json({ not: 'an array' })
      )
    )
    await expect(fetchBooks()).rejects.toThrow('Invalid books response')
  })

  test('throws when personal relations envelope is invalid', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.RELATIONS), () =>
        HttpResponse.json({ items: [], page: {}, counts: {} })
      )
    )

    await expect(fetchBookRelations()).rejects.toThrow(
      'Invalid book relations response'
    )
  })

  test('throws when the public catalog envelope is invalid', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST), () =>
        HttpResponse.json({ items: [] })
      )
    )

    await expect(fetchPublicBookCatalog({ q: 'Dune' })).rejects.toThrow(
      'Invalid public book catalog response'
    )
  })
})
