import { useChatSocket } from '@hooks/socket/useChatSocket'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { describe, expect, test, vi } from 'vitest'

const { emit, io, listeners } = vi.hoisted(() => {
  const listeners: Record<string, (...args: unknown[]) => void> = {}
  const emit = vi.fn()
  const io = vi.fn(() => ({
    on: (event: string, cb: (args: unknown) => void) => {
      listeners[event] = cb
    },
    emit,
    disconnect: vi.fn(),
  }))

  return { emit, io, listeners }
})

vi.mock('socket.io-client', () => ({
  io,
}))

vi.mock('@utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

describe('useChatSocket', () => {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: new QueryClient() }, children)

  test('uses the current origin when the API base is not configured', () => {
    renderHook(() => useChatSocket(), { wrapper })

    expect(io).toHaveBeenCalledWith('http://localhost:3000', {
      withCredentials: true,
    })
  })

  test('keeps the authenticated socket identity', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    act(() => listeners['user']({ id: 1, name: 'Me' }))
    expect(result.current.currentUser).toEqual({ id: 1, name: 'Me' })
  })

  test('sends conversation messages and joins their room', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    act(() => {
      result.current.joinConversation(9, 4)
      result.current.sendConversationMessage(9, 'client-key', 'hello', null)
    })
    expect(emit).toHaveBeenCalledWith('conversation:join', {
      conversationId: 9,
      after: 4,
    })
    expect(emit).toHaveBeenCalledWith('conversation:message', {
      conversationId: 9,
      clientKey: 'client-key',
      body: 'hello',
      attachmentMetadata: null,
    })
  })

  test('deduplicates conversation messages and agreement updates', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    const message = {
      conversationId: 9,
      sequence: 2,
      senderId: 4,
      body: 'missed message',
      clientKey: 'cursor-2',
      createdAt: '2026-08-28T00:00:00.000Z',
    }
    const update = {
      agreementId: 3,
      conversationId: 9,
      state: 'partially_confirmed',
      currentVersion: 2,
    }
    act(() => {
      listeners['conversation:message'](message)
      listeners['conversation:message'](message)
      listeners['agreement:updated'](update)
      listeners['agreement:updated'](update)
    })
    expect(result.current.conversationMessages).toEqual([message])
    expect(result.current.agreementUpdates).toEqual([update])
  })

  test('refreshes conversation queries for incoming messages', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const customWrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(() => useChatSocket(), { wrapper: customWrapper })
    act(() => {
      listeners['conversation:message']({
        conversationId: 9,
        sequence: 3,
        senderId: 4,
        body: 'nuevo mensaje',
        clientKey: 'cursor-3',
        createdAt: '2026-08-28T00:00:00.000Z',
      })
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['messages', 'conversations'],
    })
  })

  test('sets error on connect_error', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    act(() => {
      listeners['connect_error'](new Error('fail'))
    })
    expect(result.current.error).toBe('fail')
    expect(result.current.isConnected).toBe(false)
  })

  test('handles connect event', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    act(() => {
      listeners['connect']()
    })
    expect(result.current.isConnected).toBe(true)
    expect(result.current.error).toBe(null)
  })

  test('handles disconnect event', () => {
    const { result } = renderHook(() => useChatSocket(), { wrapper })
    // First connect
    act(() => {
      listeners['connect']()
    })
    expect(result.current.isConnected).toBe(true)
    // Then disconnect
    act(() => {
      listeners['disconnect']()
    })
    expect(result.current.isConnected).toBe(false)
  })
})
