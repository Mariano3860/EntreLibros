import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateActivityItems } from './fakers/activity.faker'

export const activityHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.ACTIVITY),
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    const items = generateActivityItems()
    return HttpResponse.json(items, { status: 200 })
  }
)
