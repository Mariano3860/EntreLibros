import { useQuery } from '@tanstack/react-query'

import { fetchCornersMap } from '@src/api/community/corners.service'

export const useCornersMap = () => {
  return useQuery({
    queryKey: ['community', 'corners', 'map'],
    queryFn: fetchCornersMap,
  })
}
