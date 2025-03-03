// src/hooks/auth/useLogout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/api/auth/logout.service' // Asegúrate de crear este servicio
import { AuthQueryKeys } from '@/constants/queryKeys'

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
      console.error('Logout failed:', error)
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      localStorage.removeItem('authToken')
    },
    retry: false,
  })
}
