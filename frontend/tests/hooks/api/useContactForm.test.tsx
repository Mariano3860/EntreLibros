import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { toast } from 'react-toastify'
import { describe, expect, test, vi } from 'vitest'

import { useContactForm } from '@src/hooks/api/useContactForm'

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useContactForm', () => {
  test('shows success toast', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useContactForm(onSuccess), { wrapper })
    await result.current.mutateAsync({
      name: 'John',
      email: 'john@example.com',
      message: 'Hi',
    })
    expect(toast.success).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  test('shows error toast', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useContactForm(), { wrapper })
    await expect(
      result.current.mutateAsync({
        name: 'John 400',
        email: 'john@example.com',
        message: 'Hi',
      })
    ).rejects.toThrow()
    expect(toast.error).toHaveBeenCalled()
  })
})
