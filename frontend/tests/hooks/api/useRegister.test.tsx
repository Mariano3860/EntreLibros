import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { DEFAULT_EMAIL } from '@mocks/constants/constants'
import { AuthQueryKeys } from '@src/constants/constants'
import { useRegister } from '@src/hooks/api/useRegister'

describe('useRegister', () => {
  test('sets auth data on success', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRegister(), { wrapper })
    await result.current.mutateAsync({
      name: 'User',
      email: 'unique@example.com',
      password: 'pass',
    })
    await waitFor(() =>
      expect(queryClient.getQueryData([AuthQueryKeys.AUTH])).toMatchObject({
        id: '2',
      })
    )
  })

  test('clears auth data on error', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData([AuthQueryKeys.AUTH], { id: '1' })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRegister(), { wrapper })
    await expect(
      result.current.mutateAsync({
        name: 'User',
        email: DEFAULT_EMAIL,
        password: 'pass',
      })
    ).rejects.toThrow()
    await waitFor(() =>
      expect(queryClient.getQueryData([AuthQueryKeys.AUTH])).toBeUndefined()
    )
  })
})
