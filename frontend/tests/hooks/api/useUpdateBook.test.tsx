import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { useUpdateBook } from '@hooks/api/useUpdateBook'

const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
}))

vi.mock('@src/api/axios', () => ({
  apiClient: {
    put: putMock,
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

describe('useUpdateBook', () => {
  beforeEach(() => {
    putMock.mockReset()
  })

  test('updates book successfully', async () => {
    const mockUpdate = {
      title: 'Updated Title',
      notes: 'Updated notes',
    }

    const mockResponse = {
      id: '1',
      title: 'Updated Title',
      author: 'George Orwell',
      coverUrl: 'https://example.com/cover.jpg',
      condition: 'good',
      status: 'available',
      notes: 'Updated notes',
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
      updatedAt: '2025-01-02T00:00:00Z',
    }

    putMock.mockResolvedValueOnce({ data: mockResponse })

    const { result } = renderHook(() => useUpdateBook('1'), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockUpdate)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  test('handles error correctly', async () => {
    putMock.mockRejectedValueOnce(new Error('Update failed'))

    const { result } = renderHook(() => useUpdateBook('1'), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ title: 'New Title' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })

  test('performs optimistic update with existing book data', async () => {
    const mockBook = {
      id: '1',
      title: 'Original Title',
      author: 'George Orwell',
      coverUrl: 'https://example.com/cover.jpg',
      condition: 'good',
      status: 'available',
      notes: 'Original notes',
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

    const mockUpdate = {
      title: 'Updated Title',
      notes: 'Updated notes',
    }

    const mockResponse = { ...mockBook, ...mockUpdate }

    putMock.mockResolvedValueOnce({ data: mockResponse })

    const wrapper = createWrapper()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    // Pre-populate the cache with existing book data
    queryClient.setQueryData(['book', '1'], mockBook)

    const { result } = renderHook(() => useUpdateBook('1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    result.current.mutate(mockUpdate)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  test('performs optimistic update with nested offer delivery data', async () => {
    const mockBook = {
      id: '1',
      title: 'Book Title',
      author: 'Author',
      coverUrl: 'url',
      condition: 'good',
      status: 'available',
      images: [],
      offer: {
        sale: true,
        donation: false,
        trade: false,
        price: { amount: 10, currency: 'USD' },
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

    const mockUpdate = {
      offer: {
        delivery: {
          shipping: true,
        },
      },
    }

    const mockResponse = {
      ...mockBook,
      offer: {
        ...mockBook.offer,
        delivery: {
          ...mockBook.offer.delivery,
          shipping: true,
        },
      },
    }

    putMock.mockResolvedValueOnce({ data: mockResponse })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    queryClient.setQueryData(['book', '1'], mockBook)

    const { result } = renderHook(() => useUpdateBook('1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    result.current.mutate(mockUpdate)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  test('rolls back to previous data on error', async () => {
    const mockBook = {
      id: '1',
      title: 'Original Title',
      author: 'George Orwell',
      coverUrl: 'url',
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

    putMock.mockRejectedValueOnce(new Error('Update failed'))

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    queryClient.setQueryData(['book', '1'], mockBook)

    const { result } = renderHook(() => useUpdateBook('1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    result.current.mutate({ title: 'New Title' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Verify that the data was rolled back to the original
    const cachedData = queryClient.getQueryData(['book', '1'])
    expect(cachedData).toEqual(mockBook)
  })
})
