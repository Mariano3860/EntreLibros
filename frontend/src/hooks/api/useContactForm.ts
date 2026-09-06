import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { submitContactForm } from '@src/api/contactForm/contactForm.service'
import { translateApiError } from '@src/utils/apiError'

export const useContactForm = (onSuccessCallback?: () => void) => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toast.success(t(data.message))
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
    onError: (error: Error) => {
      toast.error(translateApiError(t, error, 'contact.errors.submit_failed'))
    },
  })
}
