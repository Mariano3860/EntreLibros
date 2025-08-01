import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthQueryKeys } from '@/constants/constants'
import { login } from '@/api/auth/login.service'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token)
      queryClient.setQueryData([AuthQueryKeys.AUTH], data)
    },
    onError: (error) => {
      console.error('Login failed:', error)
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
    },
  })
}
