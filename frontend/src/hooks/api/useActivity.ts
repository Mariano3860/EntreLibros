import { useQuery } from '@tanstack/react-query'

import { fetchActivityItems } from '@src/api/community/activity.service'

export const useActivity = () => {
  return useQuery({ queryKey: ['activity'], queryFn: fetchActivityItems })
}
