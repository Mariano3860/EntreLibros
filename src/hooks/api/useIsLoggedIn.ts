import { RELATIVE_API_ROUTES } from '@api/routes'
import { useQuery } from '@tanstack/react-query'

const fetchMe = async () => {
  const res = await fetch(RELATIVE_API_ROUTES.AUTH.ME, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export const useIsLoggedIn = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
  })
  return { isLoggedIn: !!data, isLoading, isError }
}
