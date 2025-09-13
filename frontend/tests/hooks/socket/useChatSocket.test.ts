import { useChatSocket } from '@hooks/socket/useChatSocket'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const listeners: Record<string, (args: unknown) => void> = {}
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
      })
    })
    expect(result.current.currentUser).toEqual({ id: 1, name: 'Me' })
    expect(result.current.messages).toEqual([
      {
        text: 'hi',
        user: { id: 1, name: 'Me' },
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    ])
    act(() => result.current.sendMessage('hello'))
    expect(emit).toHaveBeenCalledWith('message', 'hello')
  })
})
