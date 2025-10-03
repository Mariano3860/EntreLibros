import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type { MapQueryInput, MapResponse } from '@src/api/map/map.types'
import { fetchMapData, mapKeys } from '@src/api/map/mapApi'

type UseMapDataOptions = Omit<
  UseQueryOptions<
    MapResponse,
    Error,
    MapResponse,
    ReturnType<typeof mapKeys.list>
  >,
  'queryKey' | 'queryFn'
>

export const useMapData = (
  input: MapQueryInput,
  options?: UseMapDataOptions
) => {
  return useQuery({
    queryKey: mapKeys.list(input),
    queryFn: () => fetchMapData(input),
    staleTime: 30_000,
    ...options,
  })
}
