import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { ProfilePage } from '@src/pages/profile/ProfilePage'

import { renderWithProviders } from '../../test-utils'

describe('ProfilePage', () => {
  test('renders identity, metrics and lower profile cards', () => {
    renderWithProviders(<ProfilePage />)

    expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
    for (const metric of ['146', '23', '58', '41']) {
      expect(screen.getAllByText(metric)[0]).toBeVisible()
    }
    expect(screen.getByText('Preferencias de lectura')).toBeVisible()
    expect(screen.getByText('Objetivo de lectura')).toBeVisible()
    expect(screen.getByText('Logros')).toBeVisible()
  })

  test('edits the public profile and reports success', () => {
    renderWithProviders(<ProfilePage />)

    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Mariano Lector' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      screen.getByRole('heading', { name: 'Mariano Lector' })
    ).toBeVisible()
    expect(screen.getByText('Perfil actualizado')).toBeVisible()
  })
})
