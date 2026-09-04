import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  deleteMessageDraft,
  fetchMessageDraft,
  saveMessageDraft,
  sendMessageDraft,
} from '@api/messages/messages'
import { useMessageDraft } from '@src/hooks/useMessageDraft'

vi.mock('@api/messages/messages', async () => {
  const actual = await vi.importActual<typeof import('@api/messages/messages')>(
    '@api/messages/messages'
  )
  return {
    ...actual,
    deleteMessageDraft: vi.fn(),
    fetchMessageDraft: vi.fn(),
    saveMessageDraft: vi.fn(),
    sendMessageDraft: vi.fn(),
  }
})

const draft = {
  id: 8,
  conversationId: 4,
  authorId: 2,
  body: 'Hola, ¿te interesa?',
  attachmentMetadata: null,
  revision: 3,
  createdAt: '2026-08-28T00:00:00.000Z',
  updatedAt: '2026-08-28T00:01:00.000Z',
}

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useMessageDraft', () => {
  beforeEach(() => {
    vi.mocked(fetchMessageDraft).mockResolvedValue(draft)
    vi.mocked(saveMessageDraft).mockResolvedValue({
      ...draft,
      body: 'Texto actualizado',
      revision: 4,
    })
    vi.mocked(deleteMessageDraft).mockResolvedValue(undefined)
    vi.mocked(sendMessageDraft).mockResolvedValue({
      id: 9,
      conversationId: 4,
      senderId: 2,
      sequence: 1,
      clientKey: 'draft-client-1',
      body: 'Texto actualizado',
      attachmentMetadata: null,
      createdAt: '2026-08-28T00:02:00.000Z',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('loads, saves, discards and sends a revisioned draft', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const { result } = renderHook(() => useMessageDraft(4), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.query.data).toEqual(draft))

    await result.current.save.mutateAsync({ body: 'Texto actualizado' })
    expect(saveMessageDraft).toHaveBeenCalledWith({
      conversationId: 4,
      body: 'Texto actualizado',
      revision: 3,
    })
    await waitFor(() => expect(result.current.query.data?.revision).toBe(4))

    await result.current.discard.mutateAsync()
    expect(deleteMessageDraft).toHaveBeenCalledWith(4, 4)
    await waitFor(() => expect(result.current.query.data).toBeNull())

    queryClient.setQueryData(['messages', 'draft', 4], {
      ...draft,
      revision: 4,
    })
    await waitFor(() => expect(result.current.query.data?.revision).toBe(4))
    await result.current.send.mutateAsync('draft-client-1')
    expect(sendMessageDraft).toHaveBeenCalledWith({
      conversationId: 4,
      clientKey: 'draft-client-1',
      revision: 4,
    })
    await waitFor(() => expect(result.current.query.data).toBeNull())
  })

  test('does not enable the query without a selected conversation', () => {
    const queryClient = new QueryClient()
    renderHook(() => useMessageDraft(null), {
      wrapper: createWrapper(queryClient),
    })

    expect(fetchMessageDraft).not.toHaveBeenCalled()
  })
})
