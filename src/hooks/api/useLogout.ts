import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { logout } from '@/api/auth/logout.service'
import { setAuthToken } from '@/api/axios'
import { AuthQueryKeys, HOME_URLS } from '@/constants/constants'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAuthToken()
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      navigate(`/${HOME_URLS.LOGIN}`, { replace: true })
    },
    onError: (error: Error) => {
      setAuthToken()
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      toast.error(`Error: ${error.message}`)
    },
    retry: false,
  })
}
