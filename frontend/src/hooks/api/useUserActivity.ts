import { useQuery } from '@tanstack/react-query'

import { fetchUserActivity } from '@src/api/user/activity.service'

export const useUserActivity = (enabled = true) =>
  useQuery({
    queryKey: ['userActivity'],
    queryFn: fetchUserActivity,
    enabled,
  })
