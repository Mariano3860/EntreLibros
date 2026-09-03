import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

const { createConversation, createReport, fetchPublicProfile } = vi.hoisted(
  () => ({
    createConversation: vi.fn(),
    createReport: vi.fn(),
    fetchPublicProfile: vi.fn(),
  })
)

vi.mock('@api/messages/messages', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@api/messages/messages')>()),
  createConversation,
}))
vi.mock('@api/reports/reports', () => ({ createReport }))
vi.mock('@api/user/profile.service', () => ({ fetchPublicProfile }))

import { PublicProfilePage } from '@src/pages/profile/PublicProfilePage'

import { renderWithProviders } from '../../test-utils'

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchPublicProfile.mockResolvedValue({
      id: 7,
      alias: 'Lectora visible',
      profileDescription: 'Intercambio novelas y ensayo.',
      profilePhoto: null,
      language: 'es',
      location: { latitude: -34.6, longitude: -58.4 },
      interests: ['fiction'],
      country: 'Argentina',
      city: 'Buenos Aires',
      neighborhood: 'Palermo',
    })
    createReport.mockResolvedValue({ id: 1, status: 'received' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('shows only public profile data and confirms a conduct report', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/profile/:id" element={<PublicProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile/7'] }
    )

    expect(
      await screen.findByRole('heading', { name: 'Lectora visible', level: 1 })
    ).toBeVisible()
    expect(screen.getByText(/Buenos Aires/)).toBeVisible()
    expect(screen.getByText(/Palermo/)).toBeVisible()
    expect(screen.queryByText(/-34\.6/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reportar' }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Perfil sospechoso' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'reports.submit' }))

    await waitFor(() => expect(createReport).toHaveBeenCalled())
    expect(createReport).toHaveBeenCalledWith({
      targetType: 'conduct',
      targetId: '7',
      reason: 'Perfil sospechoso',
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'reports.submitted'
    )
  })
})
