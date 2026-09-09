import { http, HttpResponse } from 'msw'

import { mockExperienceFixtures } from '@src/mocks/fixtures/experience'

import { apiRouteMatcher } from '../utils'

type DemoAction = {
  type?: 'publish-story' | 'send-message' | 'update-profile' | 'send-support'
  payload?: Record<string, unknown>
}

const demoState = {
  stories: [] as Record<string, unknown>[],
  messages: [] as Record<string, unknown>[],
  profile: { ...mockExperienceFixtures.user } as Record<string, unknown>,
  support: [] as Record<string, unknown>[],
}

export const mockHandlers = [
  http.get(apiRouteMatcher('/demo/mock'), ({ request }) => {
    const fixture = new URL(request.url).searchParams.get('fixture')
    if (fixture === 'error') {
      return HttpResponse.json({ error: 'mock_fixture_error' }, { status: 503 })
    }
    if (fixture === 'empty') {
      return HttpResponse.json({ catalog: {}, state: demoState })
    }
    return HttpResponse.json({
      catalog: mockExperienceFixtures,
      state: demoState,
    })
  }),
  http.post(apiRouteMatcher('/demo/mock/actions'), async ({ request }) => {
    const action = (await request.json()) as DemoAction
    const payload = action.payload ?? {}
    if (action.type === 'publish-story') demoState.stories.unshift(payload)
    if (action.type === 'send-message') demoState.messages.push(payload)
    if (action.type === 'update-profile')
      demoState.profile = { ...demoState.profile, ...payload }
    if (action.type === 'send-support') demoState.support.push(payload)
    return HttpResponse.json({ ok: true, state: demoState }, { status: 200 })
  }),
]
