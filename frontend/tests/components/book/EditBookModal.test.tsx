import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@src/components/ui/toaster/Toaster', () => ({
  Toaster: () => null,
  showToast: vi.fn(),
}))

vi.mock('@src/utils/analytics', () => ({
  track: vi.fn(),
}))

import { EditBookModal } from '@src/components/book/EditBookModal'
import { showToast } from '@src/components/ui/toaster/Toaster'
import { track } from '@src/utils/analytics'

import { publicationStore } from '@mocks/handlers/books/fakers/publications.faker'

import { renderWithProviders } from '../../test-utils'

describe('EditBookModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders read-only state for guests', async () => {
    publicationStore.ensure('guest-book', {
      isOwner: false,
      metadata: { title: 'Guest Title', author: 'Guest Author' },
      images: [
        { id: 'img', url: 'https://example.com/cover.jpg', alt: 'Cover' },
      ],
      notes: 'Notes',
    })

    renderWithProviders(
      <EditBookModal bookId="guest-book" isOpen={true} onClose={vi.fn()} />
    )

    await screen.findByText('bookDetail.sections.details')

    expect(screen.getByLabelText('bookDetail.fields.title')).toBeDisabled()
    expect(
      screen.queryByText('bookDetail.actions.save')
    ).not.toBeInTheDocument()
  })

  it('allows owners to update fields and shows success feedback', async () => {
    publicationStore.ensure('owner-book', {
      isOwner: true,
      metadata: { title: 'Owner Title', author: 'Owner Author' },
      notes: 'Initial note',
      images: [
        { id: 'img', url: 'https://example.com/cover.jpg', alt: 'Cover' },
      ],
    })

    renderWithProviders(
      <EditBookModal bookId="owner-book" isOpen={true} onClose={vi.fn()} />
    )

    const notesInput = await screen.findByDisplayValue('Initial note')

    fireEvent.change(notesInput, { target: { value: 'Updated note' } })

    const saveButton = screen.getByText('bookDetail.actions.save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'bookDetail.messages.saved',
        'success'
      )
    })

    expect(track).toHaveBeenCalledWith(
      'save_edit_book_success',
      expect.objectContaining({ bookId: 'owner-book' })
    )
    expect(publicationStore.get('owner-book')?.notes).toBe('Updated note')
  })
})
