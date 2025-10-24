import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import type { BookDetailModalProps } from '@components/book/BookDetailModal/BookDetailModal.types'
import { renderWithProviders } from '../../../test-utils'

const { mockUseBookDetails } = vi.hoisted(() => ({
  mockUseBookDetails: vi.fn(),
}))
vi.mock('@hooks/api/useBookDetails', () => ({
  useBookDetails: (...args: unknown[]) => mockUseBookDetails(...args),
}))

const { mockUseUpdateBook } = vi.hoisted(() => ({ mockUseUpdateBook: vi.fn() }))
vi.mock('@hooks/api/useUpdateBook', () => ({
  useUpdateBook: (...args: unknown[]) => mockUseUpdateBook(...args),
}))

const { mockUseFocusTrap } = vi.hoisted(() => ({ mockUseFocusTrap: vi.fn() }))
vi.mock('@hooks/useFocusTrap', () => ({
  useFocusTrap: mockUseFocusTrap,
}))

// helper to create a minimal valid offer shape used by the component
const makeOffer = (sale = false, donation = false) => ({
  sale,
  price: sale ? { currency: 'USD', amount: 0 } : undefined,
  trade: false,
  tradePreferences: [] as string[],
  donation,
  delivery: { nearBookCorner: false, inPerson: false, shipping: false },
})

describe('BookDetailModal', () => {
  let props: BookDetailModalProps
  let onClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onClose = vi.fn()
    props = { isOpen: true, onClose, bookId: 'book-123' }
    mockUseBookDetails.mockReset()
    mockUseUpdateBook.mockReset()
    mockUseFocusTrap.mockReset()
  })

  test('shows loading state while fetching data', () => {
    mockUseBookDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<BookDetailModal {...props} />)
    expect(mockUseBookDetails).toHaveBeenCalledWith(props.bookId)
    expect(screen.queryByLabelText('bookDetail.fields.title')).toBeNull()
  })

  test('shows error message if fetching data fails', () => {
    mockUseBookDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<BookDetailModal {...props} />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
    // button text in DOM is `bookDetail.close`
    fireEvent.click(screen.getByRole('button', { name: /bookDetail.close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  test('shows book details and offer/donation badges correctly', () => {
    const mockBook = {
      id: 'book-123',
      title: 'Title',
      author: 'Autor',
      offer: makeOffer(true, true),
      status: 'reading',
    }
    mockUseBookDetails.mockReturnValue({
      data: mockBook,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<BookDetailModal {...props} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Autor')).toBeInTheDocument()
    expect(screen.getByText('bookDetail.offer.title')).toBeInTheDocument()
    expect(screen.getByText('bookDetail.offer.donation')).toBeInTheDocument()
  })

  test.todo('allows editing fields and saving successfully', async () => {})

  test.todo('shows error when saving changes fails', async () => {})

  test.todo('cancels editing with confirmation', () => {})

  test('closes the modal when pressing Escape', () => {
    const mockBook = {
      id: 'book-123',
      title: 'Title',
      offer: makeOffer(false, false),
      status: 'to_read',
    }
    mockUseBookDetails.mockReturnValue({
      data: mockBook,
      isLoading: false,
      isError: false,
    })
    mockUseUpdateBook.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: false,
    })

    renderWithProviders(<BookDetailModal {...props} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  test.todo('resets state when closing the modal', async () => {})
})
