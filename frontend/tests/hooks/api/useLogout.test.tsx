import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { describe, expect, test, vi } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { AuthQueryKeys } from '@src/constants/constants'
import { useLogout } from '@src/hooks/api/useLogout'

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
}))

describe('useLogout', () => {
  test('removes auth data and navigates on success', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData([AuthQueryKeys.AUTH], { id: '1' })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
    const navigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigate)

    const { result } = renderHook(() => useLogout(), { wrapper })
    await result.current.mutateAsync()
    expect(queryClient.getQueryData([AuthQueryKeys.AUTH])).toBeUndefined()
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  test('shows toast on error', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
    server.use(
      http.post(apiRouteMatcher(RELATIVE_API_ROUTES.AUTH.LOGOUT), () =>
        HttpResponse.json({}, { status: 500 })
      )
    )
    const { result } = renderHook(() => useLogout(), { wrapper })
    await expect(result.current.mutateAsync()).rejects.toThrow()
    expect(toast.error).toHaveBeenCalled()
  })
})
