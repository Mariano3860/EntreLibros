import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { logout } from '@src/api/auth/logout.service'
import { AuthQueryKeys, HOME_URLS } from '@src/constants/constants'
import { translateApiError } from '@src/utils/apiError'
import { useTranslation } from 'react-i18next'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      navigate(`/${HOME_URLS.LOGIN}`, { replace: true })
    },
    onError: (error: Error) => {
      queryClient.removeQueries({ queryKey: [AuthQueryKeys.AUTH] })
      toast.error(translateApiError(t, error, 'auth.errors.unknown'))
    },
    retry: false,
  })
}
