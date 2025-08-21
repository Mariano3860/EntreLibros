import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/analytics', () => ({ track: vi.fn() }))

import i18n from '@src/assets/i18n/i18n'
import { BookFeedCard } from '@src/components/feed/cards/BookFeedCard'
import type { BookItem } from '@src/components/feed/FeedItem.types'
import { track } from '@src/utils/analytics'

import { renderWithProviders } from '../../../test-utils'

describe('BookFeedCard', () => {
  test('fires analytics on primary CTA', async () => {
    await i18n.changeLanguage('en')
    const item: BookItem = {
      type: 'book',
      id: '1',
      user: 'Ana',
      avatar: 'https://i.pravatar.cc/100?img=1',
      time: 'now',
      likes: 0,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'https://picsum.photos/seed/dune/600/400',
    }
    renderWithProviders(<BookFeedCard item={item} />)
    fireEvent.click(screen.getByLabelText('community.feed.cta.propose_swap'))
    expect(track).toHaveBeenCalledWith('feed.cta', {
      type: 'book',
      action: 'primary',
    })
  })
})
