import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { useCommunityFeed } from '@src/hooks/api/useCommunityFeed'

describe('useCommunityFeed', () => {
  test('fetches feed pages', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCommunityFeed(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0]).toHaveLength(8)
    await result.current.fetchNextPage()
    await waitFor(() => expect(result.current.data?.pages.length).toBe(2))
  })
})
