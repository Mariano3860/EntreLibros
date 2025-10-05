import { http, HttpResponse } from 'msw'

import { randomUUID } from 'crypto'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import {
  PublishCornerPayload,
  PublishCornerResponse,
} from '@src/api/community/corners.types'

import {
  generateCornerSummaries,
  generateCornersMap,
  registerCorner,
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

const buildLocationSummary = (payload: PublishCornerPayload): string => {
  if (payload.location.visibility === 'neighborhood') {
    return `${payload.location.neighborhood}, ${payload.location.city}`
  }
  return `${payload.location.city}, ${payload.location.province}`
}

export const createCornerSuccessHandler = http.post(
  RELATIVE_API_ROUTES.COMMUNITY.CORNERS.CREATE,
  async ({ request }) => {
    const payload = (await request.json()) as PublishCornerPayload

    const id = randomUUID()
    const response: PublishCornerResponse = {
      id,
      name: payload.name,
      imageUrl: payload.photo.url,
      status: payload.status,
      locationSummary: buildLocationSummary(payload),
    }

    registerCorner({
      id,
      name: payload.name,
      imageUrl: payload.photo.url,
      distanceKm: Number((Math.random() * 4 + 0.3).toFixed(1)),
    })

    return HttpResponse.json(response, { status: 201 })
  }
)

export const createCornerValidationHandler = http.post(
  RELATIVE_API_ROUTES.COMMUNITY.CORNERS.CREATE,
  async () => {
    return HttpResponse.json(
      {
        errors: {
          reference: 'La referencia no puede incluir números ni datos exactos.',
        },
      },
      { status: 422 }
    )
  }
)
