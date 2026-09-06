import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { Sidebar } from '@src/components/sidebar/Sidebar'

import { renderWithProviders } from '../../test-utils'

afterEach(() => setLoggedInState(false))

describe('Sidebar', () => {
  test('toggles menu and closes with link', async () => {
    renderWithProviders(<Sidebar />)
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' })
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
})
