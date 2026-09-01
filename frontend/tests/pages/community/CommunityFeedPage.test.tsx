import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useLocation } from 'react-router-dom'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'

import { renderWithProviders } from '../../test-utils'

describe('CommunityFeedPage', () => {
  test('renders stories, social composer and right rail', () => {
    renderWithProviders(<CommunityFeedPage />)

    expect(screen.getByText('Tu historia')).toBeVisible()
    expect(screen.getByRole('button', { name: /Foto\/Video/ })).toBeVisible()
    expect(screen.getByText('Rincones cerca de vos')).toBeVisible()
    expect(screen.getByText('Sugerencias para vos')).toBeVisible()
  })

  test('publishes a community story instead of a book', () => {
    renderWithProviders(<CommunityFeedPage />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Publicar' })[0])
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Terminé una novela increíble.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Publicar historia' }))

    expect(screen.getByText('Terminé una novela increíble.')).toBeVisible()
    expect(screen.queryByText('publishBook.title')).not.toBeInTheDocument()
  })

  test('connects the community mini map with the selected corner in Map', async () => {
    const LocationProbe = () => {
      const location = useLocation()
      return (
        <div data-testid="location">
          {location.pathname}
          {location.search}
        </div>
      )
    }

    renderWithProviders(
      <>
        <CommunityFeedPage />
        <LocationProbe />
      </>
    )

    const cornerPin = await screen.findByRole('button', {
      name: 'Ver Café Literario en el mapa',
    })
    fireEvent.click(cornerPin)
    fireEvent.click(screen.getByRole('button', { name: 'Ver mapa →' }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/map?radius=2&corner=cafe-literario'
    )
  })
})
