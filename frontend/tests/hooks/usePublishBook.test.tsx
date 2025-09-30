import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { usePublishBook } from '@hooks/api/usePublishBook'
import { PublishBookPayload } from '@src/api/books/publishBook.types'

const publishBookMock = vi.fn()

vi.mock('@api/books/books.service', () => ({
  publishBook: (payload: PublishBookPayload) => publishBookMock(payload),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { wrapper, queryClient }
}

describe('usePublishBook', () => {
  beforeEach(() => {
    publishBookMock.mockReset()
  })

  test('updates book caches with mutation result', async () => {
    const { wrapper, queryClient } = createWrapper()
    const existing = [
      { id: '1', title: '1984', author: 'George Orwell', coverUrl: '' },
    ]
    queryClient.setQueryData(['books'], existing)
    queryClient.setQueryData(['userBooks'], existing)

    const { result, unmount } = renderHook(() => usePublishBook(), {
      wrapper,
    })

    const payload: PublishBookPayload = {
      metadata: { title: 'Nuevo', author: 'Autora' },
      images: [],
      offer: {
        sale: true,
        donation: false,
        trade: false,
        price: { amount: 1200, currency: 'ARS' },
        condition: 'good',
        tradePreferences: [],
        notes: undefined,
        availability: 'public',
        delivery: {
          nearBookCorner: true,
          inPerson: true,
          shipping: false,
          shippingPayer: 'owner',
        },
      },
      draft: false,
    }

    const created = {
      id: 'new-book',
      title: 'Nuevo',
      author: 'Autora',
      coverUrl: '',
      condition: 'good',
      status: 'available' as const,
      isForSale: true,
      price: 1200,
      isForTrade: false,
      tradePreferences: [],
      isSeeking: false,
    }
    publishBookMock.mockResolvedValueOnce(created)

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(queryClient.getQueryData(['books'])).toEqual([created, ...existing])
    expect(queryClient.getQueryData(['userBooks'])).toEqual([
      created,
      ...existing,
    ])

    unmount()
  })

  test('keeps cache untouched when data is not an array', async () => {
    const { wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(['books'], { message: 'no array' })
    queryClient.setQueryData(['userBooks'], null)

    const { result, unmount } = renderHook(() => usePublishBook(), {
      wrapper,
    })

    const payload: PublishBookPayload = {
      metadata: { title: 'Titulo', author: 'Autor' },
      images: [],
      offer: {
        sale: false,
        donation: true,
        trade: false,
        price: null,
        condition: 'acceptable',
        tradePreferences: [],
        availability: 'private',
        delivery: {
          nearBookCorner: false,
          inPerson: true,
          shipping: true,
          shippingPayer: 'requester',
        },
      },
    }

    const created = {
      id: 'abc',
      title: 'Titulo',
      author: 'Autor',
      coverUrl: '',
    }
    publishBookMock.mockResolvedValueOnce(created)

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(queryClient.getQueryData(['books'])).toEqual({ message: 'no array' })
    expect(queryClient.getQueryData(['userBooks'])).toBeNull()

    unmount()
  })
})
