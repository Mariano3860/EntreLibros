import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import events from '@mocks/handlers/events/fixtures/events.json'
import { server } from '@mocks/server'
import { EventsTab } from '@src/pages/community/tabs/EventsTab'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { renderWithProviders } from '../../test-utils'

describe('EventsTab', () => {
  test('renders list of events with mock data', async () => {
    renderWithProviders(<EventsTab />)
    expect(await screen.findByText('Club de lectura Borges')).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(3)
  })

  test('changing filter shows past events', async () => {
    renderWithProviders(<EventsTab />)
    const pastButton = await screen.findByRole('button', {
      name: 'community.events.filters.status.past',
    })
    fireEvent.click(pastButton)
    expect(await screen.findByText('Presentación de autores locales')).toBeInTheDocument()
    expect(screen.queryByText('Club de lectura Borges')).not.toBeInTheDocument()
  })

  test('shows empty state when no events match filter', async () => {
    server.use(
      http.get(RELATIVE_API_ROUTES.EVENTS.LIST, () =>
        HttpResponse.json(events.filter((e) => e.status === 'upcoming'))
      )
    )
    renderWithProviders(<EventsTab />)
    const pastButton = await screen.findByRole('button', {
      name: 'community.events.filters.status.past',
    })
    fireEvent.click(pastButton)
    expect(await screen.findByText('community.events.empty.past')).toBeInTheDocument()
  })

  test('create event button is present', async () => {
    const { getByRole } = renderWithProviders(<EventsTab />)
    expect(getByRole('button', { name: 'community.events.create' })).toBeInTheDocument()
  })
})
