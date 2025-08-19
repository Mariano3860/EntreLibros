import { useMutation, useQueryClient } from '@tanstack/react-query'

import { register } from '@src/api/auth/register.service'
import { AuthQueryKeys } from '@src/constants/constants'

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData([AuthQueryKeys.AUTH], data.user)
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
    },
  })
}
