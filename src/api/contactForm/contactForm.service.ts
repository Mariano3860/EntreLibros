import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ContactFormData } from './contactForm.types'

export const submitContactForm = async (
  data: ContactFormData
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    RELATIVE_API_ROUTES.CONTACT_FORM.SUBMIT,
    data
  )
  return response.data
}
