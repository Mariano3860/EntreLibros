import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '@/api/auth/login.service'
import { AuthQueryKeys } from '@/constants/constants'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData([AuthQueryKeys.AUTH], data)
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
    },
  })
}
