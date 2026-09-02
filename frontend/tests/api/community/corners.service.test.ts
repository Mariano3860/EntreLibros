import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  createCorner,
  fetchCornerDetail,
  fetchCornersMap,
  fetchNearbyCorners,
  updateCorner,
} from '@api/community/corners.service'
import { RELATIVE_API_ROUTES } from '@api/routes'
import {
  CommunityCornerMap,
  CommunityCornerDetail,
  CommunityCornerSummary,
  PublishCornerPayload,
  UpdateCornerPayload,
} from '@api/community/corners.types'

const { getMock, patchMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('@api/axios', () => ({
  apiClient: {
    get: getMock,
    patch: patchMock,
    post: postMock,
  },
}))

describe('community corners service', () => {
  beforeEach(() => {
    getMock.mockReset()
    patchMock.mockReset()
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

  test('fetchCornerDetail gets the selected corner detail', async () => {
    const payload: CommunityCornerDetail = {
      id: 'corner-1',
      name: 'RincÃ³n Centro',
      scope: 'public',
      hostAlias: 'AnfitriÃ³n',
      rules: 'Cuidar los libros',
      schedule: 'SÃ¡bados',
      status: 'active',
      visibilityPreference: 'approximate',
      imageUrl: '/corner.jpg',
      isOwner: true,
      location: {
        city: 'Buenos Aires',
        neighborhood: 'Centro',
        referencePointLabel: 'Cerca de la plaza',
        latitude: -34.6,
        longitude: -58.4,
        approximate: true,
      },
      activity: {
        totalExchanges: 4,
        weeklyExchanges: 2,
        lastActivityAt: null,
      },
    }
    getMock.mockResolvedValueOnce({ data: payload })

    const result = await fetchCornerDetail(payload.id)

    expect(result).toEqual(payload)
    expect(getMock).toHaveBeenCalledWith(
      RELATIVE_API_ROUTES.COMMUNITY.CORNERS.DETAIL(payload.id)
    )
  })

  test('updateCorner patches the owner payload and returns refreshed detail', async () => {
    const payload: UpdateCornerPayload = {
      name: 'RincÃ³n Actualizado',
      status: 'paused',
    }
    const response = {
      id: 'corner-1',
      name: payload.name,
      status: payload.status,
    }
    patchMock.mockResolvedValueOnce({ data: response })

    const result = await updateCorner('corner-1', payload)

    expect(result).toEqual(response)
    expect(patchMock).toHaveBeenCalledWith(
      RELATIVE_API_ROUTES.COMMUNITY.CORNERS.UPDATE('corner-1'),
      payload
    )
  })
})
