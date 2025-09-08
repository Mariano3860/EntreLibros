import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

export const updateLanguage = async (language: string): Promise<void> => {
  await apiClient.post(RELATIVE_API_ROUTES.LANGUAGE.UPDATE, { language })
}
