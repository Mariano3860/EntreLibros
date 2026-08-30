import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { ContactPage } from '@src/pages/contact/ContactPage'

import { renderWithProviders } from '../../test-utils'

describe('ContactPage', () => {
  test('renders help hero, six categories and FAQ', () => {
    renderWithProviders(<ContactPage />)

    expect(
      screen.getByRole('heading', { name: '¿Cómo podemos ayudarte?' })
    ).toBeVisible()
    expect(screen.getByRole('button', { name: /Cuenta/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Seguridad/ })).toBeVisible()
    expect(screen.getByText('Preguntas frecuentes')).toBeVisible()
  })

  test('toggles FAQ and sends a support request', () => {
    renderWithProviders(<ContactPage />)

    const faq = screen.getByRole('button', { name: /Cómo publico un libro/ })
    expect(faq).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(faq)
    expect(faq).toHaveAttribute('aria-expanded', 'false')

    fireEvent.change(screen.getByLabelText('Tu consulta'), {
      target: { value: 'Necesito ayuda con un intercambio.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }))
    expect(screen.getByText('✓ Recibimos tu consulta')).toBeVisible()
  })
})
