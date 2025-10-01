import { useQuery } from '@tanstack/react-query'

import { fetchNearbyCorners } from '@src/api/community/corners.service'

export const useNearbyCorners = () => {
  return useQuery({
    queryKey: ['community', 'corners', 'nearby'],
    queryFn: fetchNearbyCorners,
  })
}
