import { describe, expect, test, vi } from 'vitest'

import { apiClient } from '@api/axios'
import { fetchMapData } from '@api/map/mapApi'
import type { MapQueryInput, MapResponse } from '@api/map/map.types'
import { generateMapResponse } from '@mocks/handlers/map/fakers/map.faker'

const input: MapQueryInput = {
  bbox: { north: -34.5, south: -34.7, east: -58.3, west: -58.6 },
  filters: {
    distanceKm: 5,
    themes: [],
    openNow: false,
    recentActivity: true,
  },
  layers: { corners: true, publications: true, activity: true },
  locale: 'es',
}

const response = {
  corners: [],
  publications: [],
  activity: [],
  meta: { bbox: input.bbox, generatedAt: '2025-01-15T12:00:00.000Z' },
} satisfies MapResponse

describe('fetchMapData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('sends the selected radius and authorized location center', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: response })

    await fetchMapData({
      ...input,
      center: { latitude: -34.6037, longitude: -58.3816 },
    })

    expect(apiClient.get).toHaveBeenCalledWith('/map', {
      params: expect.objectContaining({
        distanceKm: 5,
        centerLat: -34.6037,
        centerLon: -58.3816,
      }),
    })
  })

  test('keeps the center when no distance limit is selected', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: response })

    await fetchMapData({
      ...input,
      center: { latitude: -34.6037, longitude: -58.3816 },
      filters: { ...input.filters, distanceKm: null },
    })

    expect(apiClient.get).toHaveBeenCalledWith('/map', {
      params: expect.objectContaining({
        distanceKm: undefined,
        centerLat: -34.6037,
        centerLon: -58.3816,
      }),
    })
  })

  test('matches mock validation for unsupported radius values', async () => {
    await expect(
      apiClient.get('/map', { params: { distanceKm: 2 } })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: 'map.errors.distance_invalid' },
      },
    })
  })

  test('parses boolean query values like the backend contract', async () => {
    const fixture = generateMapResponse()
    const { data } = await apiClient.get<MapResponse>('/map', {
      params: { openNow: true, recentActivity: false },
    })

    expect(data.corners.map((item) => item.id)).toEqual(
      fixture.corners.filter((item) => item.isOpenNow).map((item) => item.id)
    )
    expect(data.activity).toEqual([])
  })

  test('falls back to corner coordinates for publications without coordinates', async () => {
    const fixture = generateMapResponse()
    const publication = fixture.publications[0]
    const corner = fixture.corners.find(
      (item) => item.id === publication.cornerId
    )
    if (!corner) throw new Error('Fixture publication corner not found')

    const originalCoordinates = {
      lat: publication.lat,
      lon: publication.lon,
    }
    publication.lat = undefined
    publication.lon = undefined

    try {
      const data = await fetchMapData({
        ...input,
        center: { latitude: corner.lat, longitude: corner.lon },
        filters: { ...input.filters, distanceKm: 1, openNow: false },
      })

      expect(data.publications.map((item) => item.id)).toContain(publication.id)
    } finally {
      publication.lat = originalCoordinates.lat
      publication.lon = originalCoordinates.lon
    }
  })
})
