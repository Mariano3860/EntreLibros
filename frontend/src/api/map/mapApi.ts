import { apiClient } from '../axios'
import { RELATIVE_API_ROUTES } from '../routes'

import type { MapQueryInput, MapResponse } from './map.types'

export const mapKeys = {
  all: ['map'] as const,
  list: (input: MapQueryInput) =>
    [
      ...mapKeys.all,
      {
        bbox: input.bbox,
        search: input.searchTerm ?? '',
        filters: input.filters,
        layers: input.layers,
        locale: input.locale,
      },
    ] as const,
}

export const fetchMapData = async (
  input: MapQueryInput
): Promise<MapResponse> => {
  const activeLayers = Object.entries(input.layers)
    .filter(([, isActive]) => isActive)
    .map(([layer]) => layer)
    .join(',')

  const params = {
    north: input.bbox.north,
    south: input.bbox.south,
    east: input.bbox.east,
    west: input.bbox.west,
    search: input.searchTerm,
    distanceKm: input.filters.distanceKm,
    themes: input.filters.themes.join(','),
    openNow: input.filters.openNow ? '1' : '0',
    recentActivity: input.filters.recentActivity ? '1' : '0',
    layers: activeLayers,
    locale: input.locale,
  }

  const { data } = await apiClient.get<MapResponse>(
    RELATIVE_API_ROUTES.MAP.ROOT,
    {
      params,
    }
  )

  return data
}
