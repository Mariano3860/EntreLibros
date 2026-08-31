import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import {
  fetchCommunityDiscovery,
  followCommunityUser,
  unfollowCommunityUser,
} from '@src/api/community/discovery.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

const discovery = {
  stories: [
    {
      id: '42',
      storyId: 'story-1',
      user: 'Clara',
      avatar: '/logo.svg',
      body: 'Una historia',
      time: 'Ahora',
      isFollowing: false,
    },
  ],
  suggestions: [
    {
      id: '42',
      user: 'Clara',
      avatar: '/logo.svg',
      reason: 'similar_interests' as const,
      commonInterests: ['fiction'],
      isFollowing: false,
    },
  ],
  recommendedBooks: [],
}

describe('community discovery services', () => {
  test('returns stories, suggestions and relevant books', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.DISCOVERY), () =>
        HttpResponse.json(discovery)
      )
    )

    await expect(fetchCommunityDiscovery()).resolves.toEqual(discovery)
  })

  test('rejects an invalid discovery response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.DISCOVERY), () =>
        HttpResponse.json({ stories: [] })
      )
    )

    await expect(fetchCommunityDiscovery()).rejects.toThrow(
      'Invalid community discovery response'
    )
  })

  test('follows and unfollows a community user', async () => {
    server.use(
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
        () => HttpResponse.json({ following: true, userId: '42' })
      ),
      http.delete(
        apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
        () => HttpResponse.json({ following: false, userId: '42' })
      )
    )

    await expect(followCommunityUser('42')).resolves.toEqual({
      following: true,
      userId: '42',
    })
    await expect(unfollowCommunityUser('42')).resolves.toEqual({
      following: false,
      userId: '42',
    })
  })
})
