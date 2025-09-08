import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchCommunityFeed } from '@src/api/community/communityFeed.service'

export const useCommunityFeed = () => {
  return useInfiniteQuery({
    queryKey: ['communityFeed'],
    queryFn: ({ pageParam = 0 }) => fetchCommunityFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 0 ? undefined : pages.length,
  })
}
