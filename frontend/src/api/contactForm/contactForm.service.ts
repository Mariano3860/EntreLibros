import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ContactFormData, ContactFormResponse } from './contactForm.types'

export const submitContactForm = async (
  data: ContactFormData
): Promise<ContactFormResponse> => {
  const response = await apiClient.post<ContactFormResponse>(
    RELATIVE_API_ROUTES.CONTACT_FORM.SUBMIT,
    data
  )
  return response.data
}
