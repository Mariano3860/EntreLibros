import { describe, expect, test, vi } from 'vitest'

vi.mock('../src/hooks/api/useIsLoggedIn', () => ({
  useIsLoggedIn: vi.fn(),
}))
vi.mock('../mocks/browser', () => ({
  worker: { start: vi.fn() },
}))

import { useIsLoggedIn } from '../src/hooks/api/useIsLoggedIn'

describe('index.tsx', () => {
  test('should render App in root element for guest users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isError: false,
    })

    vi.resetModules()
    await import('../src/index')

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(rootElement.innerHTML).toContain('home.hero_title')

    document.body.removeChild(rootElement)
  }, 30000)

  test('should render App in root element for logged in users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isError: false,
    })

    vi.resetModules()
    await import('../src/index')

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(rootElement.innerHTML).toContain('home.hero_logged_in_title')

    document.body.removeChild(rootElement)
  }, 30000)

  test('starts msw worker in development', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    vi.resetModules()
    const { worker } = await import('../mocks/browser')
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isError: false,
    })

    await import('../src/index')

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(worker.start).toHaveBeenCalled()

    document.body.removeChild(rootElement)
    process.env.NODE_ENV = originalEnv
  }, 30000)
})
