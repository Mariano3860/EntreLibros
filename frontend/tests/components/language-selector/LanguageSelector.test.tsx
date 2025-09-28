import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { LanguageSelector } from '@src/components/language-selector/LanguageSelector'

const changeLanguageMock = vi.fn()

vi.mock('@hooks/language/useUserLanguage', () => ({
  useUserLanguage: () => ({
    language: 'es',
    changeLanguage: changeLanguageMock,
  }),
}))

describe('LanguageSelector', () => {
  beforeEach(() => {
    changeLanguageMock.mockClear()
  })

  test('renders language options with the current selection', () => {
    render(<LanguageSelector />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('es')
    expect(screen.getByRole('option', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'ES' })).toBeInTheDocument()
  })

  test('changes language when selecting a different option', () => {
    render(<LanguageSelector />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'en' } })

    expect(changeLanguageMock).toHaveBeenCalledWith('en')
  })
})
