import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { UpdateProfileRequest } from '@src/api/user/profile.types'

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
  profilePhoto: null,
  profileVisibility: 'public' as const,
  locationVisibility: 'city' as const,
  location: null,
  interests: ['fiction' as const],
  country: 'Argentina' as const,
  city: 'Buenos Aires',
  neighborhood: 'Palermo',
  street: 'Av. Santa Fe 1234',
}

const { fetchProfile, updateProfile } = vi.hoisted(() => ({
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

fetchProfile.mockResolvedValue(profile)
const mockUpdatedProfile = (input: UpdateProfileRequest) => ({
  ...profile,
  alias: input.alias,
  profileDescription: input.description,
  profilePhoto: input.profilePhoto,
  profileVisibility: input.profileVisibility,
  locationVisibility: input.locationVisibility,
  interests: input.interests,
  country: input.country,
  city: input.city,
  neighborhood: input.neighborhood,
  street: input.street,
})

updateProfile.mockImplementation(async (input) => mockUpdatedProfile(input))

vi.mock('@src/api/user/profile.service', () => ({
  fetchProfile,
  updateProfile,
}))

import { ProfilePage } from '@src/pages/profile/ProfilePage'

import { renderWithProviders } from '../../test-utils'

describe('ProfilePage in real API mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchProfile.mockResolvedValue(profile)
    updateProfile.mockImplementation(async (input) => mockUpdatedProfile(input))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  test('persists photo, interests, structured location and privacy levels', async () => {
    const originalFileReader = globalThis.FileReader
    class FileReaderMock {
      public result: string | null = 'data:image/png;base64,ZmFrZQ=='
      public onload: null | (() => void) = null
      public onerror: null | (() => void) = null

      public readAsDataURL() {
        this.onload?.()
      }
    }
    globalThis.FileReader = FileReaderMock as unknown as typeof FileReader

    try {
      renderWithProviders(<ProfilePage />)
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
      )

      fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
      fireEvent.change(screen.getByLabelText('profile.photo'), {
        target: {
          files: [new File(['photo'], 'avatar.png', { type: 'image/png' })],
        },
      })
      fireEvent.click(screen.getByLabelText('profile.interestOptions.fantasy'))
      fireEvent.change(screen.getByLabelText('profile.neighborhood'), {
        target: { value: 'Chacarita' },
      })
      fireEvent.change(
        screen.getByRole('textbox', { name: /profile.street/ }),
        {
          target: { value: 'Av. Corrientes 1234' },
        }
      )
      fireEvent.change(screen.getByLabelText('profile.locationVisibility'), {
        target: { value: 'neighborhood' },
      })
      fireEvent.change(screen.getByLabelText('profile.visibility'), {
        target: { value: 'private' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await waitFor(() => expect(updateProfile).toHaveBeenCalled())
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          profilePhoto: 'data:image/png;base64,ZmFrZQ==',
          interests: ['fiction', 'fantasy'],
          country: 'Argentina',
          city: 'Buenos Aires',
          neighborhood: 'Chacarita',
          street: 'Av. Corrientes 1234',
          locationVisibility: 'neighborhood',
          profileVisibility: 'private',
        })
      )
    } finally {
      globalThis.FileReader = originalFileReader
    }
  })

  test('rejects invalid photos and exposes API save errors', async () => {
    renderWithProviders(<ProfilePage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
    )

    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
    fireEvent.change(screen.getByLabelText('profile.photo'), {
      target: {
        files: [
          new File(['not-an-image'], 'avatar.txt', { type: 'text/plain' }),
        ],
      },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.'
    )
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
    updateProfile.mockRejectedValueOnce(new Error('network down'))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron guardar los cambios.'
      )
    )
  })
})
