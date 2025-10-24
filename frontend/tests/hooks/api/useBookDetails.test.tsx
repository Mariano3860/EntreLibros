import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { useBookDetails } from '@hooks/api/useBookDetails'

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}))

vi.mock('@src/api/axios', () => ({
  apiClient: {
    get: getMock,
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useBookDetails', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  test('fetches book details successfully', async () => {
    const mockBook = {
      id: '1',
      title: '1984',
      author: 'George Orwell',
      coverUrl: 'https://example.com/cover.jpg',
      condition: 'good',
      status: 'available',
      images: [],
      offer: {
        sale: false,
        donation: true,
        trade: false,
        price: null,
        tradePreferences: [],
        availability: 'public',
        delivery: {
          nearBookCorner: true,
          inPerson: false,
          shipping: false,
        },
      },
      ownerId: 'user-123',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }

    getMock.mockResolvedValueOnce({ data: mockBook })

    const { result } = renderHook(() => useBookDetails('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockBook)
  })

  test('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useBookDetails(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(getMock).not.toHaveBeenCalled()
  })

  test('handles loading state', async () => {
    getMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  id: '1',
                  title: 'Test',
                  author: 'Author',
                  coverUrl: 'url',
                  condition: 'good',
                  status: 'available',
                  images: [],
                  offer: {
                    sale: false,
                    donation: false,
                    trade: false,
                    price: null,
                    tradePreferences: [],
                    availability: 'public',
                    delivery: {
                      nearBookCorner: false,
                      inPerson: false,
                      shipping: false,
                    },
                  },
                  ownerId: 'user-123',
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z',
                },
              }),
            100
          )
        )
    )

    const { result } = renderHook(() => useBookDetails('1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
