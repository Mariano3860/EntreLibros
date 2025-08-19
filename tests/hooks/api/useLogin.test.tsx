import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, test } from 'vitest'

import { DEFAULT_EMAIL, DEFAULT_PASS } from '@mocks/constants/constants'
import { AuthQueryKeys } from '@src/constants/constants'
import { useLogin } from '@src/hooks/api/useLogin'

describe('useLogin', () => {
  test('sets auth data on success', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLogin(), { wrapper })
    await result.current.mutateAsync({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASS,
    })
    await waitFor(() =>
      expect(queryClient.getQueryData([AuthQueryKeys.AUTH])).toMatchObject({
        id: '1',
      })
    )
  })

  test('clears auth data on error', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData([AuthQueryKeys.AUTH], { id: '1' })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLogin(), { wrapper })
    await expect(
      result.current.mutateAsync({ email: 'bad@example.com', password: 'no' })
    ).rejects.toThrow()
    await waitFor(() =>
      expect(queryClient.getQueryData([AuthQueryKeys.AUTH])).toBeUndefined()
    )
  })
})
