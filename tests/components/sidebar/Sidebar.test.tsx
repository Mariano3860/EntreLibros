import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Sidebar } from '@src/components/sidebar/Sidebar'

import { renderWithProviders } from '../../test-utils'

describe('Sidebar', () => {
  test('toggles menu and closes with link', () => {
    renderWithProviders(<Sidebar />)
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' })
    fireEvent.click(toggle)
    expect(screen.getByRole('navigation').className).toMatch(/open/)
    expect(
      screen.getByRole('link', { name: 'pages.messages' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'pages.stats' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'pages.home' }))
    expect(screen.getByRole('navigation').className).not.toMatch(/open/)
  })
})
