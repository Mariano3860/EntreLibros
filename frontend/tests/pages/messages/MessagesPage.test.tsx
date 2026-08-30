import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('renders Lucia chat and sends a message', () => {
    renderWithProviders(<MessagesPage />)

    expect(screen.getAllByText('Lucia').length).toBeGreaterThan(0)
    const input = screen.getByPlaceholderText('Escribí un mensaje...')
    fireEvent.change(input, { target: { value: 'Nos vemos mañana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText('Nos vemos mañana')).toBeVisible()
  })

  test('shows every user book and attaches the selected book', () => {
    renderWithProviders(<MessagesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Adjuntar libro' }))
    expect(
      screen.getAllByRole('button', { name: /Ecos del Viento Norte/ }).length
    ).toBeGreaterThan(0)
    const choice = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Ecos del Viento Norte'))
    expect(choice).toBeDefined()
    fireEvent.click(choice!)
    expect(screen.getByText('Libro adjunto')).toBeVisible()
  })

  test('creates an exchange proposal in the chat', () => {
    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Proponer intercambio' })
    )
    const choice = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Ecos del Viento Norte'))
    fireEvent.click(choice!)
    expect(
      screen.getAllByText('Propuesta de intercambio').length
    ).toBeGreaterThan(0)
  })
})
