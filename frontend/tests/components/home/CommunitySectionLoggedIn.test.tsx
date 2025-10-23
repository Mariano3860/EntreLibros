import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { CommunitySectionLoggedIn } from '@src/components/home/CommunitySectionLoggedIn'

import { renderWithProviders } from '../../test-utils'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CommunitySectionLoggedIn', () => {
  test('renders community section with title, subtitle and CTA button', () => {
    renderWithProviders(<CommunitySectionLoggedIn />)

    expect(
      screen.getByText('home.community_logged_in_title')
    ).toBeInTheDocument()
    expect(
      screen.getByText('home.community_logged_in_subtitle')
    ).toBeInTheDocument()
    expect(
      screen.getByText('home.community_logged_in_cta')
    ).toBeInTheDocument()
  })

  test('navigates to community page when CTA button is clicked', () => {
    renderWithProviders(<CommunitySectionLoggedIn />)

    const ctaButton = screen.getByText('home.community_logged_in_cta')
    fireEvent.click(ctaButton)

    expect(mockNavigate).toHaveBeenCalledWith('/community')
  })
})
