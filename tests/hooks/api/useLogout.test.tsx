import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

import { AUTH_COOKIE_NAME } from '../../../src/constants/constants'
import { useLogout } from '../../../src/hooks/api/useLogout'

vi.mock('../../../src/api/auth/logout.service', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  </MemoryRouter>
)

describe('useLogout', () => {
  test('clears auth cookie on logout', async () => {
    document.cookie = `${AUTH_COOKIE_NAME}=token; path=/`

    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(document.cookie).not.toContain(AUTH_COOKIE_NAME)
  })
})

