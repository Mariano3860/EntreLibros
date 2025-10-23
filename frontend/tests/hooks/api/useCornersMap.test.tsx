import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { useCornersMap } from '@src/hooks/api/useCornersMap'

describe('useCornersMap', () => {
  test('fetches corners map data', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCornersMap(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    expect(result.current.data).toHaveProperty('description')
    expect(result.current.data).toHaveProperty('pins')
  })
})
