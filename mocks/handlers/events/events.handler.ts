import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import eventsResponse from './fixtures/events.json'
import metricsResponse from './fixtures/metrics.json'

export const eventsHandler = http.get(
  RELATIVE_API_ROUTES.EVENTS.LIST,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    return HttpResponse.json(eventsResponse, { status: 200 })
  }
)

export const eventsMetricsHandler = http.get(
  RELATIVE_API_ROUTES.EVENTS.METRICS,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    return HttpResponse.json(metricsResponse, { status: 200 })
  }
)
