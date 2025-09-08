import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { submitContactForm } from '@src/api/contactForm/contactForm.service'

export const useContactForm = (onSuccessCallback?: () => void) => {
  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toast.success(data.message)
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })
}
