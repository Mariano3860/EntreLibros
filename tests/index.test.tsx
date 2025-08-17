import { screen, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../src/api/auth/me.service', () => ({
  fetchMe: vi.fn(),
}))
vi.mock('../src/hooks/api/useBooks', () => ({
  useBooks: () => ({ data: [] }),
}))
vi.mock('../mocks/browser', () => ({
  worker: { start: vi.fn() },
}))

import { fetchMe } from '../src/api/auth/me.service'

describe('index.tsx', () => {
  test('should render App in root element for guest users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.mocked(fetchMe).mockRejectedValue(new Error('unauthenticated'))

    vi.resetModules()
    await act(async () => {
      await import('../src/index')
    })

    expect(
      await screen.findByText('home.hero_title', { timeout: 3000 })
    ).toBeTruthy()

    document.body.removeChild(rootElement)
  }, 30000)

  test('should render App in root element for logged in users', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    vi.mocked(fetchMe).mockResolvedValue({ id: 1 })

    vi.resetModules()
    await act(async () => {
      await import('../src/index')
    })

    expect(
      await screen.findByText('home.hero_logged_in_title', { timeout: 3000 })
    ).toBeTruthy()

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
    vi.mocked(fetchMe).mockRejectedValue(new Error('unauthenticated'))

    await act(async () => {
      await import('../src/index')
    })
    expect(
      await screen.findByText('home.hero_title', { timeout: 3000 })
    ).toBeTruthy()
    expect(worker.start).toHaveBeenCalled()

    document.body.removeChild(rootElement)
    process.env.NODE_ENV = originalEnv
  }, 30000)
})
