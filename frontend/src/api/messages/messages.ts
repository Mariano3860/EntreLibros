import { apiClient } from '../axios'
import { RELATIVE_API_ROUTES } from '../routes'

export type ApiConversation = {
  id: number
  isBot: boolean
  participantIds: number[]
  agreementId: number | null
  lastMessageSequence: number
  updatedAt: string
  participantName: string | null
}

export type ApiMessage = {
  id: number
  conversationId: number
  senderId: number
  sequence: number
  clientKey: string
  body: string
  attachmentMetadata: {
    key: string
    contentType: string
    size: number
    name?: string
  } | null
  createdAt: string
}

export type MessagePage = {
  messages: ApiMessage[]
  nextAfter: number
}

export const messageQueryKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageQueryKeys.all, 'conversations'] as const,
  history: (conversationId: number, after = 0) =>
    [...messageQueryKeys.all, 'history', conversationId, after] as const,
}

export async function fetchConversations(): Promise<ApiConversation[]> {
  const response = await apiClient.get<{ conversations: ApiConversation[] }>(
    RELATIVE_API_ROUTES.MESSAGES.CONVERSATIONS
  )
  return response.data.conversations
}

export async function fetchMessageHistory(
  conversationId: number,
  after = 0,
  limit = 50
): Promise<MessagePage> {
  const response = await apiClient.get<MessagePage>(
    RELATIVE_API_ROUTES.MESSAGES.HISTORY(conversationId),
    { params: { after, limit } }
  )
  return response.data
}

export async function sendPersistedMessage(input: {
  conversationId: number
  clientKey: string
  body: string
}): Promise<ApiMessage> {
  const response = await apiClient.post<{ message: ApiMessage }>(
    RELATIVE_API_ROUTES.MESSAGES.HISTORY(input.conversationId),
    input
  )
  return response.data.message
}

export async function markMessagesRead(
  conversationId: number,
  sequence: number
): Promise<void> {
  await apiClient.patch(RELATIVE_API_ROUTES.MESSAGES.READ(conversationId), {
    sequence,
  })
}
