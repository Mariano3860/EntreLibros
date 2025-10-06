import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  createCorner,
  fetchCornersMap,
  fetchNearbyCorners,
} from '@api/community/corners.service'
import { RELATIVE_API_ROUTES } from '@api/routes'
import {
  CommunityCornerMap,
  CommunityCornerSummary,
  PublishCornerPayload,
} from '@api/community/corners.types'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('@api/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
  },
}))

describe('community corners service', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  test('fetchNearbyCorners returns data when response is an array', async () => {
    const payload: CommunityCornerSummary[] = [
      {
        id: '1',
        name: 'Rincón Centro',
        imageUrl: '/corner.jpg',
        distanceKm: 1.2,
      },
    ]
    getMock.mockResolvedValueOnce({ data: payload })

    const result = await fetchNearbyCorners()

    expect(result).toEqual(payload)
    expect(getMock).toHaveBeenCalledWith(
      RELATIVE_API_ROUTES.COMMUNITY.CORNERS.NEARBY
    )
  })

  test('fetchNearbyCorners throws on invalid payload', async () => {
    getMock.mockResolvedValueOnce({ data: { invalid: true } })

    await expect(fetchNearbyCorners()).rejects.toThrow(
      'Invalid corners response'
    )
  })

  test('fetchCornersMap validates pins array', async () => {
    const payload: CommunityCornerMap = {
      pins: [
        {
          id: 'pin-1',
          name: 'Rincón Norte',
          x: -58.38,
          y: -34.6,
          status: 'active',
        },
      ],
    }
    getMock.mockResolvedValueOnce({ data: payload })

    const result = await fetchCornersMap()

    expect(result).toEqual(payload)
    expect(getMock).toHaveBeenCalledWith(
      RELATIVE_API_ROUTES.COMMUNITY.CORNERS.MAP
    )
  })

  test('fetchCornersMap throws when pins are missing', async () => {
    getMock.mockResolvedValueOnce({ data: { pins: null } })

    await expect(fetchCornersMap()).rejects.toThrow(
      'Invalid corners map response'
    )
  })

  test('createCorner posts payload and returns response data', async () => {
    const payload = {
      name: 'Rincón Nueva Dirección',
      scope: 'public',
      hostAlias: 'Anfitriona',
      internalContact: 'contacto@entrelibros.org',
      rules: 'Reglas',
      schedule: '',
      location: {
        address: {
          street: 'Libertad',
          number: '987',
          unit: '',
          postalCode: '1001',
        },
        coordinates: { latitude: -34.6037, longitude: -58.3816 },
        visibilityPreference: 'exact',
      },
      consent: true,
      photo: { id: 'photo', url: '/corner.jpg' },
      status: 'active',
      draft: false,
    } satisfies PublishCornerPayload

    const response = {
      id: 'new-corner',
      name: payload.name,
      imageUrl: payload.photo.url,
      status: payload.status,
      locationSummary: 'Libertad 987',
    }

    postMock.mockResolvedValueOnce({ data: response })

    const result = await createCorner(payload)

    expect(result).toEqual(response)
    expect(postMock).toHaveBeenCalledWith(
      RELATIVE_API_ROUTES.COMMUNITY.CORNERS.CREATE,
      payload
    )
  })
})
