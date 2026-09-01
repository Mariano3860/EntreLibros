import { describe, expect, it, vi } from 'vitest'

import { apiClient } from '@api/axios'
import {
  createConversation,
  fetchConversations,
  fetchMessagingContacts,
  fetchMessageHistory,
  messageQueryKeys,
  sendPersistedMessage,
} from '@api/messages/messages'

describe('messaging API client', () => {
  it('creates a conversation for an authorized participant', async () => {
    const conversation = {
      id: 4,
      isBot: false,
      participantIds: [1, 2],
      agreementId: null,
      lastMessageSequence: 0,
      updatedAt: '2026-08-28T00:00:00.000Z',
      participantName: 'Ana',
      unreadCount: 2,
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { conversation },
    })

    await expect(createConversation(2)).resolves.toEqual(conversation)
    expect(apiClient.post).toHaveBeenCalledWith('/messages/conversations', {
      participantId: 2,
    })
  })

  it('lists conversations from the persisted API', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { conversations: [] },
    })

    await expect(fetchConversations()).resolves.toEqual([])
  })

  it('searches messaging contacts by name and preserves follow ordering data', async () => {
    const contacts = [
      { id: 8, name: 'Ana Gómez', alias: 'anita', isFollowing: true },
      { id: 9, name: 'Pablo Ruiz', alias: 'pablo', isFollowing: false },
    ]
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { contacts },
    })

    await expect(fetchMessagingContacts('ana')).resolves.toEqual(contacts)
    expect(apiClient.get).toHaveBeenCalledWith('/messages/contacts', {
      params: { search: 'ana' },
    })
  })

  it('serializes history pagination and preserves the server cursor', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { messages: [], nextAfter: 12 },
    })

    await expect(fetchMessageHistory(4, 10, 20)).resolves.toEqual({
      messages: [],
      nextAfter: 12,
    })
    expect(apiClient.get).toHaveBeenCalledWith('/messages/4/messages', {
      params: { after: 10, limit: 20 },
    })
    expect(messageQueryKeys.history(4, 10)).toEqual([
      'messages',
      'history',
      4,
      10,
    ])
  })

  it('returns the persisted message from the send response', async () => {
    const message = {
      id: 3,
      conversationId: 4,
      senderId: 2,
      sequence: 1,
      clientKey: 'client-1',
      body: 'Hola',
      attachmentMetadata: null,
      createdAt: '2026-08-28T00:00:00.000Z',
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { message } })

    await expect(
      sendPersistedMessage({
        conversationId: 4,
        clientKey: 'client-1',
        body: 'Hola',
      })
    ).resolves.toEqual(message)
  })
})
