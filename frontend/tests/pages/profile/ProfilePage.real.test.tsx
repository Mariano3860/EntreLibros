import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

const profile = {
  id: 7,
  name: 'Mariano',
  alias: 'Mariano',
  email: 'mariano@example.com',
  language: 'es',
  profileDescription: 'Lector de prueba',
  profileVisibility: 'public' as const,
  locationVisibility: 'city' as const,
  location: null,
  interests: ['fiction' as const],
  city: 'Buenos Aires',
  neighborhood: 'Palermo',
}

const { fetchProfile, updateProfile } = vi.hoisted(() => ({
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

fetchProfile.mockResolvedValue(profile)
updateProfile.mockImplementation(async (input) => ({
  ...profile,
  alias: input.alias,
  profileDescription: input.description,
  city: input.city,
}))

vi.mock('@src/api/user/profile.service', () => ({
  fetchProfile,
  updateProfile,
}))

import { ProfilePage } from '@src/pages/profile/ProfilePage'

import { renderWithProviders } from '../../test-utils'

describe('ProfilePage in real API mode', () => {
  test('loads and persists profile edits through the API contract', async () => {
    renderWithProviders(<ProfilePage />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
    )

    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Mariano Actualizado' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ alias: 'Mariano Actualizado' })
    )
    expect(
      await screen.findByRole('heading', { name: 'Mariano Actualizado' })
    ).toBeVisible()
  })
})
