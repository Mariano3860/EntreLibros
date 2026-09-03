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
const { cropProfilePhotoToSquare } = vi.hoisted(() => ({
  cropProfilePhotoToSquare: vi.fn(),
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

const installFileReader = (result: string) => {
  const originalFileReader = globalThis.FileReader
  class FileReaderMock {
    public result: string | null = result
    public onload: null | (() => void) = null
    public onerror: null | (() => void) = null

    public readAsDataURL() {
      this.onload?.()
    }
  }
  globalThis.FileReader = FileReaderMock as unknown as typeof FileReader
  return () => {
    globalThis.FileReader = originalFileReader
  }
}

vi.mock('@src/api/user/profile.service', () => ({
  fetchProfile,
  updateProfile,
}))

vi.mock('@src/pages/profile/profilePhoto', async () => {
  const actual = await vi.importActual<
    typeof import('@src/pages/profile/profilePhoto')
  >('@src/pages/profile/profilePhoto')
  return { ...actual, cropProfilePhotoToSquare }
})

import { ProfilePage } from '@src/pages/profile/ProfilePage'

import { renderWithProviders } from '../../test-utils'

describe('ProfilePage in real API mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchProfile.mockResolvedValue(profile)
    updateProfile.mockImplementation(async (input) => mockUpdatedProfile(input))
    cropProfilePhotoToSquare.mockResolvedValue('data:image/png;base64,cropped')
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
    const restoreFileReader = installFileReader(
      'data:image/png;base64,ZmFrZQ=='
    )

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
      await screen.findByText('Ajustá el encuadre')
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
          profilePhoto: 'data:image/png;base64,cropped',
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
      restoreFileReader()
    }
  })

  test('replaces an existing photo and can select the same filename again', async () => {
    const profileWithPhoto = {
      ...profile,
      profilePhoto: 'data:image/png;base64,old-photo',
    }
    fetchProfile.mockResolvedValue(profileWithPhoto)
    updateProfile.mockImplementation(async (input) => ({
      ...profileWithPhoto,
      profilePhoto: input.profilePhoto,
    }))
    const restoreFileReader = installFileReader(
      'data:image/png;base64,new-photo'
    )

    try {
      renderWithProviders(<ProfilePage />)
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
      )

      fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
      const input = screen.getByLabelText('profile.photo') as HTMLInputElement
      const file = new File(['photo'], 'portrait.png', {
        type: 'image/png',
      })
      fireEvent.change(input, { target: { files: [file] } })
      await screen.findByText('Ajustá el encuadre')
      expect(input.value).toBe('')
      fireEvent.change(screen.getByRole('slider', { name: 'Horizontal' }), {
        target: { value: '80' },
      })
      expect(screen.getByRole('slider', { name: 'Horizontal' })).toHaveValue(
        '80'
      )
      fireEvent.change(input, { target: { files: [file] } })
      await screen.findByRole('slider', { name: 'Horizontal' })
      expect(input.value).toBe('')

      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
      await waitFor(() => expect(updateProfile).toHaveBeenCalled())
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          profilePhoto: 'data:image/png;base64,cropped',
        })
      )
    } finally {
      restoreFileReader()
    }
  })

  test('keeps the persisted photo when an invalid replacement is selected', async () => {
    const profileWithPhoto = {
      ...profile,
      profilePhoto: 'data:image/png;base64,old-photo',
    }
    fetchProfile.mockResolvedValue(profileWithPhoto)

    renderWithProviders(<ProfilePage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
    )
    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))

    const photoLabel = screen.getByText('profile.photo')
    const nameInput = screen.getByLabelText('Nombre')
    expect(
      photoLabel.compareDocumentPosition(nameInput) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()

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
    ).not.toBeDisabled()
    expect(
      Array.from(document.querySelectorAll('img')).some(
        (image) => image.getAttribute('src') === profileWithPhoto.profilePhoto
      )
    ).toBe(true)
  })

  test('keeps the persisted photo after the server rejects a replacement', async () => {
    const profileWithPhoto = {
      ...profile,
      profilePhoto: 'data:image/png;base64,old-photo',
    }
    fetchProfile.mockResolvedValue(profileWithPhoto)
    updateProfile.mockRejectedValueOnce(new Error('network down'))
    const restoreFileReader = installFileReader(
      'data:image/png;base64,new-photo'
    )

    try {
      renderWithProviders(<ProfilePage />)
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
      )
      fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
      fireEvent.change(screen.getByLabelText('profile.photo'), {
        target: {
          files: [
            new File(['photo'], 'replacement.png', { type: 'image/png' }),
          ],
        },
      })
      await screen.findByText('Ajustá el encuadre')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudieron guardar los cambios.'
        )
      )
      expect(
        Array.from(document.querySelectorAll('img')).some(
          (image) => image.getAttribute('src') === profileWithPhoto.profilePhoto
        )
      ).toBe(true)
    } finally {
      restoreFileReader()
    }
  })

  test('sends null when removing an existing photo', async () => {
    const profileWithPhoto = {
      ...profile,
      profilePhoto: 'data:image/png;base64,old-photo',
    }
    fetchProfile.mockResolvedValue(profileWithPhoto)
    updateProfile.mockImplementation(async (input) => ({
      ...profileWithPhoto,
      profilePhoto: input.profilePhoto,
    }))

    renderWithProviders(<ProfilePage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
    )
    fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
    fireEvent.click(screen.getByRole('button', { name: 'profile.removePhoto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ profilePhoto: null })
    )
  })

  test('discards a pending replacement when the editor is cancelled', async () => {
    const profileWithPhoto = {
      ...profile,
      profilePhoto: 'data:image/png;base64,old-photo',
    }
    fetchProfile.mockResolvedValue(profileWithPhoto)
    const restoreFileReader = installFileReader(
      'data:image/png;base64,new-photo'
    )

    try {
      renderWithProviders(<ProfilePage />)
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'Mariano' })).toBeVisible()
      )
      fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))
      fireEvent.change(screen.getByLabelText('profile.photo'), {
        target: {
          files: [new File(['photo'], 'portrait.png', { type: 'image/png' })],
        },
      })
      await screen.findByText('Ajustá el encuadre')
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      fireEvent.click(screen.getByRole('button', { name: /Editar perfil/ }))

      expect(screen.queryByText('Ajustá el encuadre')).not.toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    } finally {
      restoreFileReader()
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
