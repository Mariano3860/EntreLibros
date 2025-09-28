import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mutateMock = vi.fn<(language: string) => void>()
const getCookieMock = vi.fn<(name: string) => string | undefined>()
const setCookieMock = vi.fn<(name: string, value: string) => void>()

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: mutateMock,
  }),
}))

vi.mock('@utils/cookies', () => ({
  getCookie: getCookieMock,
  setCookie: setCookieMock,
  clearAllCookies: vi.fn(),
  default: vi.fn(),
}))

const renderUseUserLanguage = async () => {
  const { useUserLanguage } = await import(
    '@src/hooks/language/useUserLanguage'
  )
  return renderHook(() => useUserLanguage())
}

describe('useUserLanguage', () => {
  beforeEach(() => {
    vi.resetModules()
    mutateMock.mockReset()
    getCookieMock.mockReset()
    setCookieMock.mockReset()
  })

  test('initializes language from cookie when available', async () => {
    getCookieMock.mockReturnValue('en')

    const { result } = await renderUseUserLanguage()

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith('en')
    })

    expect(setCookieMock).not.toHaveBeenCalled()
    expect(result.current.language).toBe('es')
  })

  test('falls back to current i18n language when cookie is missing', async () => {
    getCookieMock.mockReturnValue(undefined)

    await renderUseUserLanguage()

    await waitFor(() => {
      expect(setCookieMock).toHaveBeenCalledWith('language', 'es')
    })

    expect(mutateMock).toHaveBeenCalledWith('es')
  })

  test('changes language and persists it when selecting a new value', async () => {
    getCookieMock.mockReturnValue(undefined)

    const { result } = await renderUseUserLanguage()

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith('es')
    })

    mutateMock.mockClear()
    setCookieMock.mockClear()

    act(() => {
      result.current.changeLanguage('en')
    })

    expect(setCookieMock).toHaveBeenCalledWith('language', 'en')
    expect(mutateMock).toHaveBeenCalledWith('en')
  })

  test('does not trigger updates when selecting the current language', async () => {
    getCookieMock.mockReturnValue(undefined)

    const { result } = await renderUseUserLanguage()

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith('es')
    })

    mutateMock.mockClear()
    setCookieMock.mockClear()

    act(() => {
      result.current.changeLanguage('es')
    })

    expect(setCookieMock).not.toHaveBeenCalled()
    expect(mutateMock).not.toHaveBeenCalled()
  })
})
