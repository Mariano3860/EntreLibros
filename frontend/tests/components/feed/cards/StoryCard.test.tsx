import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { StoryCard } from '@src/components/feed/cards/StoryCard'
import type { StoryItem } from '@src/components/feed/FeedItem.types'

import { renderWithProviders } from '../../../test-utils'

const baseStory: StoryItem = {
  type: 'story',
  id: 'story-1',
  user: 'Ana',
  avatar: 'https://example.com/ana.jpg',
  time: 'hace 1 h',
  likes: 3,
  title: 'Una lectura especial',
  body: 'Este libro me acompañó durante todo el verano.',
}

describe('StoryCard', () => {
  test('renders a story without optional media or book', () => {
    renderWithProviders(<StoryCard item={baseStory} />)

    expect(screen.getByText(baseStory.body)).toBeInTheDocument()
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    expect(screen.queryByText(/Dune/)).not.toBeInTheDocument()
  })

  test('renders the image and referenced book and supports liking it', () => {
    const item: StoryItem = {
      ...baseStory,
      image: 'https://example.com/story.jpg',
      book: {
        id: 'book-1',
        title: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://example.com/dune.jpg',
      },
    }

    renderWithProviders(<StoryCard item={item} />)

    expect(screen.getByRole('presentation')).toHaveAttribute('src', item.image)
    expect(screen.getByText(/Dune/)).toBeInTheDocument()

    const likeButton = screen.getByRole('button', { name: /like/i })
    fireEvent.click(likeButton)
    expect(likeButton).toBeInTheDocument()
  })
})
