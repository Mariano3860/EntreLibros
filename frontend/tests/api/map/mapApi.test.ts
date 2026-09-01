import { describe, expect, test, vi } from 'vitest'

import { apiClient } from '@api/axios'
import { fetchMapData } from '@api/map/mapApi'
import type { MapQueryInput, MapResponse } from '@api/map/map.types'

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

  test('omits distance and center when no limit or location is selected', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: response })

    await fetchMapData({
      ...input,
      center: undefined,
      filters: { ...input.filters, distanceKm: null },
    })

    expect(apiClient.get).toHaveBeenCalledWith('/map', {
      params: expect.objectContaining({
        distanceKm: undefined,
        centerLat: undefined,
        centerLon: undefined,
      }),
    })
  })
})
