import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

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
    onError: (error: Error) => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      toast.error(`Error: ${error.message}`)
    },
  })
}
