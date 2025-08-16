import { fetchMe } from '@api/auth/me.service'
import { useQuery } from '@tanstack/react-query'

import { AuthQueryKeys } from '@/constants/constants'

export const useIsLoggedIn = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: [AuthQueryKeys.AUTH],
    queryFn: fetchMe,
    retry: false,
  })
  return { isLoggedIn: !!data, isLoading, isError }
}
