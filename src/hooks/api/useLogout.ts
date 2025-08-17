import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { logout } from '@/api/auth/logout.service'
import {
  AUTH_COOKIE_NAME,
  AuthQueryKeys,
  HOME_URLS,
} from '@/constants/constants'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const clearAuthCookie = () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuthCookie()
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      navigate(`/${HOME_URLS.LOGIN}`, { replace: true })
    },
    onError: (error: Error) => {
      clearAuthCookie()
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      toast.error(`Error: ${error.message}`)
    },
    retry: false,
  })
}
