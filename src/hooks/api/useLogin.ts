import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '@src/api/auth/login.service'
import { AuthQueryKeys } from '@src/constants/constants'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData([AuthQueryKeys.AUTH], data.user)
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
    },
  })
}
