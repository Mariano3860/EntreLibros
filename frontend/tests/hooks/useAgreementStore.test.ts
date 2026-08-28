import { act, renderHook } from '@testing-library/react'

import type {
  AgreementDetails,
  AgreementVersion,
  Conversation,
} from '@components/messages/Messages.types'
import { useAgreementStore } from '@components/messages/useAgreementStore'

describe('useAgreementStore', () => {
  const baseConversation: Conversation = {
    id: 1,
    user: {
      name: 'Samuel',
      avatar: 'avatar',
      online: true,
    },
    badges: [],
    messages: [],
    myBooks: [],
    theirBooks: [],
  }

  const details: AgreementDetails = {
    meetingPoint: 'Café Luz',
    area: 'Centro',
    date: 'lunes',
    time: '10:00',
    bookTitle: 'Dune',
  }

  it('creates new versions and marks previous ones as inactive', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    let firstVersion: AgreementVersion | null = null
    act(() => {
      firstVersion = result.current.proposeVersion(1, details, 'Alice')
    })
    expect(firstVersion).not.toBeNull()
    expect(result.current.getVersion(1, 1)?.version).toBe(1)
    expect(result.current.getVersion(1, 1)?.status).toBe('pending')

    act(() => {
      result.current.proposeVersion(
        1,
        {
          ...details,
          time: '11:00',
        },
        'Alice'
      )
    })

    const previous = result.current.getVersion(1, 1)
    const newest = result.current.getVersion(1, 2)
    expect(previous?.status).toBe('inactive')
    expect(newest?.version).toBe(2)
    expect(newest?.status).toBe('pending')
  })

  it('updates confirmation status when both parties confirm', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    act(() => {
      result.current.proposeVersion(1, details, 'Alice')
    })

    act(() => {
      result.current.confirmVersion(1, 1, 'Alice')
    })
    expect(result.current.getVersion(1, 1)?.status).toBe('confirmed')
    expect(result.current.getVersion(1, 1)?.confirmedBy).toContain('Alice')

    act(() => {
      result.current.confirmVersion(1, 1, 'Bob')
    })
    expect(result.current.getVersion(1, 1)?.status).toBe('fullyConfirmed')
    expect(result.current.getVersion(1, 1)?.confirmedBy).toEqual(['Alice', 'Bob'])
  })

  it('keeps confirmation idempotent for the same user', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    act(() => {
      result.current.proposeVersion(1, details, 'Alice')
    })

    act(() => {
      result.current.confirmVersion(1, 1, 'Alice')
      result.current.confirmVersion(1, 1, 'Alice')
    })
    expect(result.current.getVersion(1, 1)?.confirmedBy).toEqual(['Alice'])
  })

  it('marks a version as cancelled', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    act(() => {
      result.current.proposeVersion(1, details, 'Alice')
    })

    act(() => {
      result.current.cancelVersion(1, 1, 'Alice')
    })
    expect(result.current.getVersion(1, 1)?.status).toBe('cancelled')
  })

  it('keeps both actors when confirmations are queued before a render', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    act(() => {
      result.current.proposeVersion(1, details, 'Alice')
      result.current.confirmVersion(1, 1, 'Alice')
      result.current.confirmVersion(1, 1, 'Bob')
    })

    const version = result.current.getVersion(1, 1)
    expect(version?.confirmedBy).toEqual(['Alice', 'Bob'])
    expect(version?.status).toBe('fullyConfirmed')
  })

  it('keeps the first cancellation when cancellation requests are queued', () => {
    const { result } = renderHook(() => useAgreementStore([baseConversation]))

    act(() => {
      result.current.proposeVersion(1, details, 'Alice')
      result.current.cancelVersion(1, 1, 'Alice')
      result.current.cancelVersion(1, 1, 'Bob')
    })

    const version = result.current.getVersion(1, 1)
    expect(version?.status).toBe('cancelled')
    expect(version?.history.at(-1)?.changedBy).toBe('Alice')
  })
})
