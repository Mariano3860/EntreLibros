import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '@/api/auth/login.service'
import { setAuthToken } from '@/api/axios'
import { AuthQueryKeys } from '@/constants/constants'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthToken(data.token)
      queryClient.setQueryData([AuthQueryKeys.AUTH], data)
    },
    onError: () => {
      setAuthToken()
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
    },
  })
}
