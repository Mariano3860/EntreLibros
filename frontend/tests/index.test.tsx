import { screen, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const enableMockingMock = vi.fn(() => Promise.resolve())

vi.mock('@src/setupMocks', () => ({
  enableMocking: enableMockingMock,
}))

const setupMocks = async () => {
  const fetchMeMock = vi.fn()

  vi.doMock('@src/api/auth/me.service', () => ({
    fetchMe: fetchMeMock,
  }))
  vi.doMock('@src/hooks/api/useBooks', () => ({
    useBooks: () => ({ data: [] }),
  }))

  const { fetchMe } = await import('@src/api/auth/me.service')

  return { fetchMe }
}

describe('index.tsx', () => {
  test('should render App in root element for guest users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.resetModules()
    enableMockingMock.mockClear()
    const mocks = await setupMocks()

    vi.mocked(mocks.fetchMe).mockRejectedValue(new Error('unauthenticated'))

    await act(async () => {
      await import('@src/index')
    })

    expect(await screen.findByText('home.hero_title')).toBeTruthy()

    document.body.removeChild(rootElement)
  }, 30000)

  test('should render App in root element for logged in users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.resetModules()
    enableMockingMock.mockClear()
    const mocks = await setupMocks()

    vi.mocked(mocks.fetchMe).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    })

    await act(async () => {
      await import('@src/index')
    })

    expect(await screen.findByText('home.hero_logged_in_title')).toBeTruthy()

    document.body.removeChild(rootElement)
  }, 30000)

  test('awaits enableMocking before rendering in development', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    vi.resetModules()
    enableMockingMock.mockClear()
    const mocks = await setupMocks()

    vi.mocked(mocks.fetchMe).mockRejectedValue(new Error('unauthenticated'))

    await act(async () => {
      await import('@src/index')
    })

    expect(await screen.findByText('home.hero_title')).toBeTruthy()
    expect(enableMockingMock).toHaveBeenCalledTimes(1)

    document.body.removeChild(rootElement)
    process.env.NODE_ENV = originalEnv
  }, 30000)
})
