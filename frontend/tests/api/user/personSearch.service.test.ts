import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  fetchPeople,
  setPersonFollowing,
} from '@src/api/user/personSearch.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('person search service', () => {
  test('trims the query and removes fields outside the safe DTO', async () => {
    server.use(
      http.get(
        apiRouteMatcher(RELATIVE_API_ROUTES.USER.SEARCH),
        ({ request }) => {
          expect(new URL(request.url).searchParams.get('q')).toBe('ana')
          return HttpResponse.json([
            {
              id: 7,
              name: 'Ana',
              alias: 'ana',
              profilePhoto: null,
              booksCount: 3,
              exchangeCount: 1,
              isFollowing: false,
              email: 'private@example.com',
            },
          ])
        }
      )
    )

    await expect(fetchPeople('  ana  ')).resolves.toEqual([
      {
        id: 7,
        name: 'Ana',
        alias: 'ana',
        profilePhoto: null,
        booksCount: 3,
        exchangeCount: 1,
        isFollowing: false,
      },
    ])
  })

  test('rejects malformed search responses', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.USER.SEARCH), () =>
        HttpResponse.json([
          {
            id: 7,
            name: 'Ana',
            alias: 'ana',
            profilePhoto: null,
            booksCount: -1,
            exchangeCount: 0,
            isFollowing: false,
          },
        ])
      )
    )

    await expect(fetchPeople('ana')).rejects.toThrow(
      'Invalid person search response'
    )
  })

  test('calls the existing follow endpoint and validates both states', async () => {
    server.use(
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
        () =>
          HttpResponse.json({ following: true, userId: '7' }, { status: 201 })
      ),
      http.delete(
        apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
        () => HttpResponse.json({ following: false, userId: '7' })
      )
    )

    await expect(setPersonFollowing(7, true)).resolves.toEqual({
      following: true,
      userId: '7',
    })
    await expect(setPersonFollowing(7, false)).resolves.toEqual({
      following: false,
      userId: '7',
    })
  })
})
