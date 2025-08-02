import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { logout } from '@/api/auth/logout.service'
import { AuthQueryKeys } from '@/constants/constants'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      localStorage.removeItem('authToken')

      navigate('/', { replace: true })
    },
    onError: (error: Error) => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      localStorage.removeItem('authToken')
      return error
    },
    retry: false,
  })
}
