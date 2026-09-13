import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { UserProfile } from '@src/api/user/profile.types'

const { fetchMe, fetchProfile, fetchConversations } = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  fetchProfile: vi.fn(),
  fetchConversations: vi.fn(),
}))

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))
vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))
vi.mock('@src/api/user/profile.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@src/api/user/profile.service')>()),
  fetchProfile,
}))
vi.mock('@src/api/messages/messages', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@src/api/messages/messages')>()),
  fetchConversations,
}))
vi.mock('@src/components/notifications/NotificationBell', () => ({
  NotificationBell: () => null,
}))

import { Sidebar } from '@src/components/sidebar/Sidebar'

import { renderWithProviders } from '../../test-utils'

const profile: UserProfile = {
  id: 7,
  name: 'Lucía Fernández',
  alias: 'lucia.lee',
  email: 'lucia@example.com',
  language: 'es',
  profileDescription: null,
  profilePhoto: 'https://example.test/lucia.jpg',
  profileVisibility: 'public',
  locationVisibility: 'city',
  location: null,
  interests: [],
  country: 'Argentina',
  city: 'Buenos Aires',
  neighborhood: null,
  street: null,
}

describe('Sidebar with the real profile projection', () => {
  beforeEach(() => {
    fetchMe.mockResolvedValue({ id: profile.id, email: profile.email })
    fetchProfile.mockResolvedValue(profile)
    fetchConversations.mockResolvedValue([])
  })

  afterEach(() => vi.clearAllMocks())

  test('shows the current profile name, alias and photo instead of a fixed identity', async () => {
    renderWithProviders(<Sidebar />)

    expect(await screen.findByText('Lucía Fernández')).toBeVisible()
    expect(screen.getByText('@lucia.lee')).toBeVisible()
    expect(
      screen.getByRole('img', { name: 'Lucía Fernández' })
    ).toHaveAttribute('src', profile.profilePhoto)
    expect(screen.queryByText('Mariano')).not.toBeInTheDocument()
  })

  test('uses deterministic initials when the profile photo cannot be displayed', async () => {
    fetchProfile.mockResolvedValue({ ...profile, profilePhoto: null })
    renderWithProviders(<Sidebar />)

    expect(await screen.findByText('LF')).toBeVisible()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  test('keeps the name readable when the profile has no alias', async () => {
    fetchProfile.mockResolvedValue({
      ...profile,
      alias: '',
      profilePhoto: null,
    })
    renderWithProviders(<Sidebar />)

    expect(await screen.findByText('Lucía Fernández')).toBeVisible()
    expect(screen.getByText('Sin alias')).toBeVisible()
    expect(screen.getByText('LF')).toBeVisible()
  })

  test('updates the summary when the current profile cache changes', async () => {
    const { queryClient } = renderWithProviders(<Sidebar />)
    await screen.findByText('Lucía Fernández')

    queryClient.setQueryData(['profile', profile.id], {
      ...profile,
      name: 'Lucía Actualizada',
      alias: 'lucia.actualizada',
      profilePhoto: null,
    })

    await waitFor(() =>
      expect(screen.getByText('Lucía Actualizada')).toBeVisible()
    )
    expect(screen.getByText('@lucia.actualizada')).toBeVisible()
    expect(screen.getByText('LA')).toBeVisible()
  })

  test('falls back to initials after an image load error', async () => {
    renderWithProviders(<Sidebar />)

    const image = await screen.findByRole('img', { name: 'Lucía Fernández' })
    fireEvent.error(image)

    await waitFor(() => expect(screen.getByText('LF')).toBeVisible())
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
