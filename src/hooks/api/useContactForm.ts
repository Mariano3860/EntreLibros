import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { submitContactForm } from '@/api/contactForm/contactForm.service'

export const useContactForm = () => {
  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })
}
