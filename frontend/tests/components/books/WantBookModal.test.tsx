import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}))

import { WantBookModal } from '@components/books/WantBookModal/WantBookModal'

import { renderWithProviders } from '../../test-utils'

describe('WantBookModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('prefills a viewed book and publishes a want listing', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()

    renderWithProviders(
      <WantBookModal
        isOpen
        initialBook={{
          title: 'Libro unico del modal',
          author: 'Autor del modal',
          coverUrl: 'https://covers.example.com/modal.jpg',
        }}
        onClose={onClose}
        onCreated={onCreated}
      />
    )

    expect(screen.getByLabelText('booksPage.want.titleLabel')).toHaveValue(
      'Libro unico del modal'
    )
    fireEvent.change(screen.getByLabelText('booksPage.want.notesLabel'), {
      target: { value: 'Edicion en español' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.want.submit' })
    )

    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith('booksPage.want.created')
  })

  test('uses catalog search results to fill bibliographic fields', async () => {
    renderWithProviders(
      <WantBookModal isOpen onClose={vi.fn()} onCreated={vi.fn()} />
    )

    fireEvent.change(screen.getByLabelText('booksPage.want.search'), {
      target: { value: '1984' },
    })

    const result = await screen.findByRole('option')
    fireEvent.click(result)

    expect(screen.getByLabelText('booksPage.want.titleLabel')).toHaveValue(
      '1984'
    )
    expect(screen.getByLabelText('booksPage.want.isbnLabel')).toHaveValue(
      '9780451524935'
    )
  })

  test('shows an error when the want publication is duplicated', async () => {
    const props = {
      title: 'Busqueda duplicada',
      author: 'Autor duplicado',
    }
    const renderModal = () =>
      renderWithProviders(
        <WantBookModal
          isOpen
          initialBook={props}
          onClose={vi.fn()}
          onCreated={vi.fn()}
        />
      )

    renderModal()
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.want.submit' })
    )
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())

    cleanup()
    vi.clearAllMocks()
    renderModal()
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.want.submit' })
    )
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('booksPage.want.duplicate')
    )
  })
})
