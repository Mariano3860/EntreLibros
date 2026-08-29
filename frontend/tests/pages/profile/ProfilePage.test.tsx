import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { UserProfile } from '@src/api/user/profile.types'
import { ProfilePage } from '@src/pages/profile/ProfilePage'

import { renderWithProviders } from '../../test-utils'

const { fetchProfileMock, updateProfileMock } = vi.hoisted(() => ({
  fetchProfileMock: vi.fn<() => Promise<UserProfile>>(),
  updateProfileMock: vi.fn(),
}))

vi.mock('@src/api/user/profile.service', () => ({
  fetchProfile: fetchProfileMock,
  updateProfile: updateProfileMock,
}))

vi.mock('@contexts/auth/AuthContext', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@contexts/auth/AuthContext')>()
  return { ...actual, useAuth: () => ({ isAuthenticated: true }) }
})

vi.mock('@hooks/api/useNotifications', () => ({
  useNotifications: () => ({ data: [] }),
  useNotificationPreference: () => ({
    data: true,
    update: { isPending: false, mutate: vi.fn() },
  }),
}))

const profile: UserProfile = {
  id: 1,
  name: 'Ana',
  alias: 'Ana lectora',
  email: 'ana@example.com',
  language: 'es',
  profileDescription: null,
  profileVisibility: 'public',
  locationVisibility: 'city',
  location: null,
  interests: ['fiction'],
  city: 'Buenos Aires',
  neighborhood: 'Palermo',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    fetchProfileMock.mockResolvedValue(profile)
    updateProfileMock.mockResolvedValue(profile)
  })

  test('loads interests and location, clears neighborhood when city changes', async () => {
    renderWithProviders(<ProfilePage />)

    expect(await screen.findByDisplayValue('Ana lectora')).toBeInTheDocument()
    expect(
      screen.getByLabelText('profile.interestOptions.fiction')
    ).toBeChecked()
    expect(screen.getByDisplayValue('Palermo')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('profile.city'), {
      target: { value: 'La Plata' },
    })

    expect(screen.getByLabelText('profile.neighborhood')).toHaveValue('')
    expect(screen.queryByDisplayValue('Palermo')).not.toBeInTheDocument()
  })

  test('recommends three interests without blocking a valid profile save', async () => {
    renderWithProviders(<ProfilePage />)

    await screen.findByDisplayValue('Ana lectora')
    expect(
      screen.getByText('profile.interestsRecommendation')
    ).toBeInTheDocument()

    fireEvent.submit(
      screen.getByRole('button', { name: 'profile.save' }).closest('form')!
    )

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalled())
    expect(updateProfileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        interests: ['fiction'],
        city: 'Buenos Aires',
        neighborhood: 'Palermo',
      })
    )
  })
})
