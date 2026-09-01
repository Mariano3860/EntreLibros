import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  createWantBook,
  toggleBookInterest,
} from '@src/api/books/bookInteractions.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('book interaction service', () => {
  test('toggles interest through the API', async () => {
    const first = await toggleBookInterest('1')
    const second = await toggleBookInterest('1')

    expect(first).toEqual({ listingId: '1', interested: true })
    expect(second).toEqual({ listingId: '1', interested: false })
  })

  test('creates a want publication without offer fields', async () => {
    const result = await createWantBook({
      type: 'want',
      metadata: { title: '1984', author: 'George Orwell' },
      notes: 'Cualquier edicion',
    })

    expect(result).toMatchObject({
      type: 'want',
      isSeeking: true,
      title: '1984',
    })
  })

  test('rejects malformed interaction responses', async () => {
    server.use(
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.INTEREST(':id')),
        () => HttpResponse.json({ interested: true })
      )
    )

    await expect(toggleBookInterest('bad')).rejects.toThrow(
      'Invalid interest response'
    )
  })
})
