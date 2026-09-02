import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  createCommunityComment,
  fetchCommunityComments,
  toggleCommunityLike,
} from '@src/api/community/communitySocial.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('community social service', () => {
  test('toggles a like and validates the response', async () => {
    server.use(
      http.post(
        apiRouteMatcher(
          RELATIVE_API_ROUTES.COMMUNITY.POST_LIKE('listing', '42')
        ),
        () => HttpResponse.json({ liked: true, likes: 3 })
      )
    )

    await expect(toggleCommunityLike('listing', '42')).resolves.toEqual({
      liked: true,
      likes: 3,
    })
  })

  test('reads and creates comments', async () => {
    server.use(
      http.get(
        apiRouteMatcher(
          RELATIVE_API_ROUTES.COMMUNITY.POST_COMMENTS('story', 'story-9')
        ),
        () =>
          HttpResponse.json([
            {
              id: '1',
              author: 'Clara',
              avatar: '/logo.svg',
              body: 'Me encantó.',
              createdAt: '2026-09-02T12:00:00.000Z',
            },
          ])
      ),
      http.post(
        apiRouteMatcher(
          RELATIVE_API_ROUTES.COMMUNITY.POST_COMMENTS('story', 'story-9')
        ),
        () =>
          HttpResponse.json(
            {
              id: '2',
              author: 'Mariano',
              avatar: '/logo.svg',
              body: 'También la recomiendo.',
              createdAt: '2026-09-02T12:01:00.000Z',
            },
            { status: 201 }
          )
      )
    )

    await expect(
      fetchCommunityComments('story', 'story-9')
    ).resolves.toHaveLength(1)
    await expect(
      createCommunityComment('story', 'story-9', 'También la recomiendo.')
    ).resolves.toMatchObject({ id: '2', author: 'Mariano' })
  })

  test('rejects malformed like responses', async () => {
    server.use(
      http.post(
        apiRouteMatcher(
          RELATIVE_API_ROUTES.COMMUNITY.POST_LIKE('listing', '42')
        ),
        () => HttpResponse.json({ liked: true })
      )
    )

    await expect(toggleCommunityLike('listing', '42')).rejects.toThrow(
      'Invalid community like response'
    )
  })
})
