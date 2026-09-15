import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
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
vi.mock('@api/user/profile.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@api/user/profile.service')>()),
  fetchPublicProfile,
}))

import { PublicProfilePage } from '@src/pages/profile/PublicProfilePage'
import { setLoggedInState } from '@mocks/handlers/auth/me.handler'

import { renderWithProviders } from '../../test-utils'

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setLoggedInState(true)
    fetchPublicProfile.mockResolvedValue({
      id: 7,
      alias: 'Lectora visible',
      profileDescription: 'Intercambio novelas y ensayo.',
      profilePhoto: null,
      language: 'es',
      location: { latitude: -34.6, longitude: -58.4 },
      interests: ['fiction', 'history', 'classics'],
      country: 'Argentina',
      city: 'Buenos Aires',
      neighborhood: 'Palermo',
    })
    createReport.mockResolvedValue({ id: 1, status: 'received' })
  })

  afterEach(() => {
    setLoggedInState(false)
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
    expect(screen.getByText('Ficción')).toBeVisible()
    expect(screen.getByText('Historia')).toBeVisible()
    expect(screen.getByText('Clásicos')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Reportar' }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Perfil sospechoso' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }))

    await waitFor(() => expect(createReport).toHaveBeenCalled())
    expect(createReport).toHaveBeenCalledWith({
      targetType: 'conduct',
      targetId: '7',
      reason: 'Perfil sospechoso',
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Reporte recibido. Gracias por avisar.'
    )
  })

  test('localizes the public profile and report modal without changing profile data', async () => {
    await useTranslation().i18n.changeLanguage('en')
    renderWithProviders(
      <Routes>
        <Route path="/profile/:id" element={<PublicProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile/7'] }
    )

    expect(
      await screen.findByRole('heading', { name: 'Lectora visible', level: 1 })
    ).toBeVisible()
    expect(screen.getByText('Fiction')).toBeVisible()
    expect(screen.getByText('History')).toBeVisible()
    expect(screen.getByText('Classics')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Report' }))
    expect(screen.getByRole('heading', { name: 'Report' })).toBeVisible()
    expect(screen.getByLabelText('Close')).toBeVisible()
    expect(screen.getByText('Reason')).toBeVisible()

    const submit = screen.getByRole('button', { name: 'Submit report' })
    expect(submit).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Suspicious profile' },
    })
    expect(submit).toBeEnabled()
  })
})
