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
})
