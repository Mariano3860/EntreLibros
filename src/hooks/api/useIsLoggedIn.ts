import { apiClient } from '@api/axios'
import { RELATIVE_API_ROUTES } from '@api/routes'
import { useQuery } from '@tanstack/react-query'

const fetchMe = async () => {
  const res = await apiClient.get(RELATIVE_API_ROUTES.AUTH.ME)
  return res.data
}

export const useIsLoggedIn = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
  })
  return { isLoggedIn: !!data, isLoading, isError }
}
