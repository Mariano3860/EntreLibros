import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoginRequest, LoginResponse } from '@/api/auth/login.types'
import { login } from '@/api/auth/login.service'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], data)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}
