import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '@/api/auth/login.service'
import { AuthQueryKeys } from '@/constants/constants'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token)
      queryClient.setQueryData([AuthQueryKeys.AUTH], data)
    },
    onError: (error) => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      return error
    },
  })
}
