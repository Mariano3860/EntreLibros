import { useChatSocket } from '@hooks/socket/useChatSocket'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const listeners: Record<string, (...args: unknown[]) => void> = {}
const emit = vi.fn()

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: (event: string, cb: (args: unknown) => void) => {
      listeners[event] = cb
    },
    emit,
    disconnect: vi.fn(),
  }),
}))

describe('useChatSocket', () => {
  test('handles incoming and outgoing messages', () => {
    const { result } = renderHook(() => useChatSocket())
    act(() => {
      listeners['user']({ id: 1, name: 'Me' })
      listeners['message']({
        text: 'hi',
        user: { id: 1, name: 'Me' },
        timestamp: '2023-01-01T00:00:00.000Z',
        channel: 'general',
      })
    })
    expect(result.current.currentUser).toEqual({ id: 1, name: 'Me' })
    expect(result.current.messages).toEqual([
      {
        text: 'hi',
        user: { id: 1, name: 'Me' },
        timestamp: '2023-01-01T00:00:00.000Z',
        channel: 'general',
      },
    ])
    act(() => result.current.sendMessage('hello', 'general'))
    expect(emit).toHaveBeenCalledWith('message', {
      text: 'hello',
      channel: 'general',
    })
  })

  test('sets error on connect_error', () => {
    const { result } = renderHook(() => useChatSocket())
    act(() => {
      listeners['connect_error'](new Error('fail'))
    })
    expect(result.current.error).toBe('fail')
    expect(result.current.isConnected).toBe(false)
  })

  test('handles connect event', () => {
    const { result } = renderHook(() => useChatSocket())
    act(() => {
      listeners['connect']()
    })
    expect(result.current.isConnected).toBe(true)
    expect(result.current.error).toBe(null)
  })

  test('handles disconnect event', () => {
    const { result } = renderHook(() => useChatSocket())
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
