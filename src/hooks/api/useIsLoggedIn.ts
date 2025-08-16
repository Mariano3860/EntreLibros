import { fetchMe } from '@api/auth/me.service'
import { useQuery } from '@tanstack/react-query'

export const useIsLoggedIn = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
  })
  return { isLoggedIn: !!data, isLoading, isError }
}
