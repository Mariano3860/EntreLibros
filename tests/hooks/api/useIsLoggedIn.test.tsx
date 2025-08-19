import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { useIsLoggedIn } from '@src/hooks/api/useIsLoggedIn'

describe('useIsLoggedIn', () => {
  test('returns false when not authenticated', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useIsLoggedIn(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isLoggedIn).toBe(false)
  })

  test('returns true when authenticated', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    setLoggedInState(true)
    const { result } = renderHook(() => useIsLoggedIn(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isLoggedIn).toBe(true)
    setLoggedInState(false)
  })
})
