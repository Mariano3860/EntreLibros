import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { Message } from './messages.types'

export const fetchMessages = async (): Promise<Message[]> => {
  const response = await apiClient.get<Message[]>(RELATIVE_API_ROUTES.MESSAGES.LIST)
  if (!Array.isArray(response.data)) {
    throw new Error('Invalid messages response')
  }
  return response.data
}

export const sendMessage = async (content: string): Promise<Message> => {
  const response = await apiClient.post<Message>(
    RELATIVE_API_ROUTES.MESSAGES.LIST,
    { content }
  )
  return response.data
}
