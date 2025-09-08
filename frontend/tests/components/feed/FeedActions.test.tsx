import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

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
})
