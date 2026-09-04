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
  unreadCount: number
}

export type MessagingContact = {
  id: number
  name: string
  alias: string
  isFollowing: boolean
}

export type ApiMessageBookAttachment = {
  id: string
  title: string
  author: string
  coverUrl: string
  ownerId?: number
  condition?: string | null
}

export type ApiMessageAgreementDetails = {
  meetingPoint: string
  area: string
  date: string
  time: string
  bookTitle: string
}

export type ApiMessageAttachment =
  | {
      key: string
      contentType: string
      size: number
      name?: string
      kind: 'book'
      bookId: string
      title: string
      author: string
      coverUrl: string
      ownerId?: number
      condition?: string | null
    }
  | {
      key: string
      contentType: string
      size: number
      name?: string
      kind: 'swap'
      offered: ApiMessageBookAttachment
      requested: ApiMessageBookAttachment
      note?: string
    }
  | {
      key: string
      contentType: string
      size: number
      name?: string
      kind: 'agreement'
      agreementId: number
      version: number
      event:
        | 'proposal'
        | 'counterproposal'
        | 'confirm'
        | 'cancel'
        | 'reject'
        | 'complete'
      details: ApiMessageAgreementDetails
      listingIds: number[]
      actorName: string
      reason?: string
    }

export type ApiMessageDraftAttachment =
  | Extract<ApiMessageAttachment, { kind: 'book' }>
  | Extract<ApiMessageAttachment, { kind: 'swap' }>
  | {
      key: string
      contentType: string
      size: number
      name?: string
      kind: 'agreementProposal'
      listingIds: number[]
      details: ApiMessageAgreementDetails
      agreementId?: number
      expectedVersion?: number
    }

export type ApiMessage = {
  id: number
  conversationId: number
  senderId: number
  sequence: number
  clientKey: string
  body: string
  attachmentMetadata: ApiMessageAttachment | null
  createdAt: string
}

export type ApiMessageDraft = {
  id: number
  conversationId: number
  authorId: number
  body: string
  attachmentMetadata: ApiMessageDraftAttachment | null
  revision: number
  createdAt: string
  updatedAt: string
}

export type MessagePage = {
  messages: ApiMessage[]
  nextAfter: number
}

export type ConversationBook = {
  id: string
  title: string
  author: string
  coverUrl: string
  ownerId?: number
  condition?: string | null
}

export type ConversationBooks = {
  myBooks: ConversationBook[]
  theirBooks: ConversationBook[]
}

export const messageQueryKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageQueryKeys.all, 'conversations'] as const,
  contacts: (search = '') =>
    [...messageQueryKeys.all, 'contacts', search] as const,
  history: (conversationId: number, after = 0) =>
    [...messageQueryKeys.all, 'history', conversationId, after] as const,
  books: (conversationId: number) =>
    [...messageQueryKeys.all, 'books', conversationId] as const,
  draft: (conversationId: number) =>
    [...messageQueryKeys.all, 'draft', conversationId] as const,
}

export async function fetchConversations(): Promise<ApiConversation[]> {
  const response = await apiClient.get<{ conversations: ApiConversation[] }>(
    RELATIVE_API_ROUTES.MESSAGES.CONVERSATIONS
  )
  return response.data.conversations
}

export async function fetchMessagingContacts(
  search = ''
): Promise<MessagingContact[]> {
  const response = await apiClient.get<{ contacts: MessagingContact[] }>(
    RELATIVE_API_ROUTES.MESSAGES.CONTACTS,
    { params: { search } }
  )
  return response.data.contacts
}

export async function createConversation(
  participantId: number,
  options?: { silent?: boolean }
): Promise<ApiConversation> {
  const response = await apiClient.post<{ conversation: ApiConversation }>(
    RELATIVE_API_ROUTES.MESSAGES.CREATE_CONVERSATION,
    {
      participantId,
      ...(options?.silent ? { silent: true } : {}),
    }
  )
  return response.data.conversation
}

export async function fetchMessageDraft(
  conversationId: number
): Promise<ApiMessageDraft | null> {
  const response = await apiClient.get<{ draft: ApiMessageDraft | null }>(
    RELATIVE_API_ROUTES.MESSAGES.DRAFT(conversationId)
  )
  return response.data.draft
}

export async function saveMessageDraft(input: {
  conversationId: number
  body: string
  attachmentMetadata?: ApiMessageDraftAttachment | null
  revision?: number
}): Promise<ApiMessageDraft> {
  const response = await apiClient.put<{ draft: ApiMessageDraft }>(
    RELATIVE_API_ROUTES.MESSAGES.DRAFT(input.conversationId),
    {
      body: input.body,
      attachmentMetadata: input.attachmentMetadata ?? null,
      ...(input.revision !== undefined ? { revision: input.revision } : {}),
    }
  )
  return response.data.draft
}

export async function deleteMessageDraft(
  conversationId: number,
  revision?: number
): Promise<void> {
  await apiClient.delete(RELATIVE_API_ROUTES.MESSAGES.DRAFT(conversationId), {
    ...(revision !== undefined ? { params: { revision } } : {}),
  })
}

export async function sendMessageDraft(input: {
  conversationId: number
  clientKey: string
  revision?: number
}): Promise<ApiMessage> {
  const response = await apiClient.post<{ message: ApiMessage }>(
    RELATIVE_API_ROUTES.MESSAGES.SEND_DRAFT(input.conversationId),
    {
      clientKey: input.clientKey,
      ...(input.revision !== undefined ? { revision: input.revision } : {}),
    }
  )
  return response.data.message
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

export async function fetchConversationBooks(
  conversationId: number
): Promise<ConversationBooks> {
  const response = await apiClient.get<ConversationBooks>(
    RELATIVE_API_ROUTES.MESSAGES.BOOKS(conversationId)
  )
  return response.data
}

export async function sendPersistedMessage(input: {
  conversationId: number
  clientKey: string
  body: string
  attachmentMetadata?: ApiMessage['attachmentMetadata']
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
