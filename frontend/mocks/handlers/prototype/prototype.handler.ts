import { http, HttpResponse } from 'msw'

import { prototypeCatalog } from '@src/features/prototype/catalog'

import { apiRouteMatcher } from '../utils'

type DemoAction = {
  type?: 'publish-story' | 'send-message' | 'update-profile' | 'send-support'
  payload?: Record<string, unknown>
}

const demoState = {
  stories: [] as Record<string, unknown>[],
  messages: [] as Record<string, unknown>[],
  profile: { ...prototypeCatalog.user } as Record<string, unknown>,
  support: [] as Record<string, unknown>[],
}

export const prototypeHandlers = [
  http.get(apiRouteMatcher('/demo/prototype'), ({ request }) => {
    const fixture = new URL(request.url).searchParams.get('fixture')
    if (fixture === 'error') {
      return HttpResponse.json(
        { error: 'prototype_fixture_error' },
        { status: 503 }
      )
    }
    if (fixture === 'empty') {
      return HttpResponse.json({ catalog: {}, state: demoState })
    }
    return HttpResponse.json({ catalog: prototypeCatalog, state: demoState })
  }),
  http.post(apiRouteMatcher('/demo/prototype/actions'), async ({ request }) => {
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
