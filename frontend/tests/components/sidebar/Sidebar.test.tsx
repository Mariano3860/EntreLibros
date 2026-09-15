import { fireEvent, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
import { afterEach, describe, expect, test } from 'vitest'

import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { Sidebar } from '@src/components/sidebar/Sidebar'

import { renderWithProviders } from '../../test-utils'

afterEach(() => setLoggedInState(false))

describe('Sidebar', () => {
  test('toggles menu and closes with link', async () => {
    renderWithProviders(<Sidebar />)
    const toggle = screen.getByRole('button', { name: 'Alternar navegación' })
    fireEvent.click(toggle)
    expect(screen.getByRole('navigation').className).toMatch(/open/)
    expect(
      screen.queryByRole('link', { name: 'pages.messages' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'pages.stats' })
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'auth.required.register' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'pages.home' }))
    expect(screen.getByRole('navigation').className).not.toMatch(/open/)
  })

  test('shows the personal books entry only for authenticated users', async () => {
    setLoggedInState(true)

    renderWithProviders(<Sidebar />)

    expect(
      await screen.findByRole('link', { name: 'pages.books' })
    ).toHaveAttribute('href', '/books')
    expect(
      screen.queryByRole('link', { name: 'pages.exploreBooks' })
    ).not.toBeInTheDocument()
  })

  test('localizes the navigation toggle and profile entry in English', async () => {
    setLoggedInState(true)
    await useTranslation().i18n.changeLanguage('en')

    renderWithProviders(<Sidebar />)

    expect(
      screen.getByRole('button', { name: 'Toggle navigation' })
    ).toBeVisible()
    expect(
      await screen.findByRole('link', { name: 'Profile' })
    ).toHaveAttribute('href', '/profile')
  })
})
