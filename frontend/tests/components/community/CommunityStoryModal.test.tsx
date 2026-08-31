import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@api/community/communityStories.service', () => ({
  createCommunityStory: vi.fn().mockResolvedValue({
    id: 'story-created',
    type: 'story',
    user: 'Mariano',
    avatar: '',
    time: 'Ahora',
    likes: 0,
    title: 'Una nueva historia',
    body: 'Una nueva historia',
  }),
}))

import { createCommunityStory } from '@api/community/communityStories.service'
import { CommunityStoryModal } from '@src/components/community/CommunityStoryModal'

import { renderWithProviders } from '../../test-utils'

describe('CommunityStoryModal', () => {
  test('publishes a story with optional book data', async () => {
    const onPublished = vi.fn()

    renderWithProviders(
      <CommunityStoryModal
        isOpen
        books={[
          {
            id: 'book-1',
            title: 'Dune',
            author: 'Frank Herbert',
            coverUrl: '',
          },
        ]}
        onClose={vi.fn()}
        onPublished={onPublished}
      />
    )

    fireEvent.change(screen.getByLabelText('community.story.bodyLabel'), {
      target: { value: 'Una recomendación para la comunidad.' },
    })
    fireEvent.change(screen.getByLabelText('community.story.bookLabel'), {
      target: { value: 'book-1' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'community.story.publish' })
    )

    await waitFor(() => expect(onPublished).toHaveBeenCalled())
    expect(createCommunityStory).toHaveBeenCalledWith({
      body: 'Una recomendación para la comunidad.',
      imageUrl: null,
      bookListingId: 'book-1',
    })
  })

  test('closes without publishing', () => {
    const onClose = vi.fn()
    renderWithProviders(
      <CommunityStoryModal
        isOpen
        books={[]}
        onClose={onClose}
        onPublished={vi.fn()}
      />
    )

    fireEvent.click(
      screen.getAllByRole('button', { name: 'community.story.cancel' })[0]
    )
    expect(onClose).toHaveBeenCalled()
  })

  test('previews an image and exposes publish errors', async () => {
    vi.mocked(createCommunityStory).mockRejectedValueOnce(new Error('failed'))
    renderWithProviders(
      <CommunityStoryModal
        isOpen
        books={[]}
        onClose={vi.fn()}
        onPublished={vi.fn()}
      />
    )

    const file = new File(['cover'], 'cover.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('community.story.imageLabel'), {
      target: { files: [file] },
    })
    await waitFor(() =>
      expect(document.querySelector('img[class*="preview"]')).not.toBeNull()
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'community.story.publish' })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'community.story.error'
    )
  })
})
