import { useQuery } from '@tanstack/react-query'

import { fetchCommunityStats } from '@src/api/community/communityStats.service'

export const useCommunityStats = () => {
  return useQuery({ queryKey: ['communityStats'], queryFn: fetchCommunityStats })
}
