import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import i18n from '@src/assets/i18n/i18n'
import { FeedActions } from '@src/components/feed/FeedActions'

import { renderWithProviders } from '../../test-utils'

describe('FeedActions', () => {
  test('toggles like count', async () => {
    await i18n.changeLanguage('en')
    renderWithProviders(<FeedActions initialLikes={1} />)
    const likeBtn = screen.getByLabelText(/like/i)
    expect(screen.getByText(/^1/)).toBeInTheDocument()
    fireEvent.click(likeBtn)
    expect(screen.getByText(/^2/)).toBeInTheDocument()
    fireEvent.click(likeBtn)
    expect(screen.getByText(/^1/)).toBeInTheDocument()
  })

  test('adds a comment in the local experience', async () => {
    renderWithProviders(<FeedActions initialCommentsCount={0} />)

    fireEvent.click(screen.getByRole('button', { name: /comment/i }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Una lectura imperdible.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /commentSubmit/i }))

    expect(screen.getByText('Una lectura imperdible.')).toBeVisible()
    expect(screen.getByText(/^1 /)).toBeInTheDocument()
  })

  test('falls back to the canonical URL when sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderWithProviders(<FeedActions post={{ type: 'listing', id: '42' }} />)

    fireEvent.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        'http://localhost:3000/community?post=listing%3A42'
      )
    )
    expect(screen.getByRole('status')).toBeVisible()
  })
})
