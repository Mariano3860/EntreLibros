import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import {
  generateCornerSummaries,
  generateCornersMap,
} from './fakers/corners.faker'

export const nearbyCornersHandler = http.get(
  RELATIVE_API_ROUTES.COMMUNITY.CORNERS.NEARBY,
  () => {
    const corners = generateCornerSummaries()
    return HttpResponse.json(corners, { status: 200 })
  }
)

export const cornersMapHandler = http.get(
  RELATIVE_API_ROUTES.COMMUNITY.CORNERS.MAP,
  () => {
    const map = generateCornersMap()
    return HttpResponse.json(map, { status: 200 })
  }
)
