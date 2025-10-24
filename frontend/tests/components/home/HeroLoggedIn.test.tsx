import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { HeroLoggedIn } from '@src/components/home/HeroLoggedIn'

import { renderWithProviders } from '../../test-utils'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('HeroLoggedIn', () => {
  test('renders hero section with title, subtitle and CTA button', () => {
    renderWithProviders(<HeroLoggedIn />)

    expect(screen.getByText('home.hero_logged_in_title')).toBeInTheDocument()
    expect(screen.getByText('home.hero_logged_in_subtitle')).toBeInTheDocument()
    expect(screen.getByText('home.hero_logged_in_cta')).toBeInTheDocument()
  })

  test('navigates to books page when CTA button is clicked', () => {
    renderWithProviders(<HeroLoggedIn />)

    const ctaButton = screen.getByText('home.hero_logged_in_cta')
    fireEvent.click(ctaButton)

    expect(mockNavigate).toHaveBeenCalledWith('/books')
  })
})
