import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

afterEach(() => {
  vi.useRealTimers()
  window.localStorage.clear()
})

describe('BooksPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<BooksPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })

  test('filters books by tab selection', async () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(
      screen.getByRole('tab', { name: 'booksPage.tabs.for_trade' })
    )
    expect(await screen.findByText('1984')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'booksPage.tabs.seeking' }))
    expect(await screen.findByText('El pulpo invisible')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('tab', { name: 'booksPage.tabs.for_sale' })
    )
    expect(await screen.findByText('Matisse en Bélgica')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'booksPage.tabs.mine' }))
    expect(await screen.findByText('Matisse en Bélgica')).toBeInTheDocument()
  })

  test('shows empty state when search yields no results', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.change(
      screen.getByPlaceholderText('booksPage.search_placeholder'),
      {
        target: { value: 'zzzzz' },
      }
    )
    expect(screen.getByText('booksPage.empty.mine')).toBeInTheDocument()
  })

  test('opens publish modal when navigating to /books/new', () => {
    const { getByText } = renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/new'],
    })

    expect(getByText('publishBook.title')).toBeInTheDocument()
  })

  test('prefills metadata from search result', async () => {
    renderWithProviders(<BooksPage />, { initialEntries: ['/books/new'] })

    const searchInput = screen.getByPlaceholderText(
      'publishBook.search.placeholder'
    )

    fireEvent.change(searchInput, { target: { value: '1984' } })

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'publishBook.search.use' },
        { timeout: 2000 }
      )
    )

    await waitFor(() => {
      expect(screen.getByLabelText('publishBook.fields.title')).toHaveValue(
        '1984'
      )
    })

    const nextButton = screen.getByRole('button', { name: 'publishBook.next' })
    await waitFor(() => expect(nextButton).not.toBeDisabled())
  })

  test('saves draft and resumes later', async () => {
    const { unmount } = renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/new'],
    })

    fireEvent.change(screen.getByLabelText('publishBook.fields.title'), {
      target: { value: 'Mi libro secreto' },
    })
    fireEvent.change(screen.getByLabelText('publishBook.fields.author'), {
      target: { value: 'Ana Autora' },
    })
    fireEvent.change(screen.getByLabelText('publishBook.fields.language'), {
      target: { value: 'ES' },
    })
    fireEvent.change(screen.getByLabelText('publishBook.fields.format'), {
      target: { value: 'Tapa blanda' },
    })

    const file = new File(['cover'], 'cover.jpg', { type: 'image/jpeg' })
    const uploader = screen.getByLabelText('publishBook.uploader.cta')
    fireEvent.change(uploader, { target: { files: [file] } })

    fireEvent.click(
      screen.getByRole('button', { name: 'publishBook.saveDraft' })
    )

    unmount()

    vi.useFakeTimers()

    const { getByText, getByRole } = renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/new'],
    })

    expect(getByText('publishBook.resume.title')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(3000)

    vi.useRealTimers()

    fireEvent.click(
      getByRole('button', { name: 'publishBook.resume.continue' })
    )

    expect(
      await screen.findByDisplayValue('Mi libro secreto')
    ).toBeInTheDocument()
  })

  test('keeps focus while typing metadata fields', () => {
    renderWithProviders(<BooksPage />, { initialEntries: ['/books/new'] })

    const titleInput = screen.getByLabelText('publishBook.fields.title')
    titleInput.focus()

    expect(document.activeElement).toBe(titleInput)

    fireEvent.change(titleInput, { target: { value: 'L' } })
    expect(document.activeElement).toBe(titleInput)

    fireEvent.change(titleInput, { target: { value: 'Li' } })

    expect(titleInput).toHaveValue('Li')
    expect(document.activeElement).toBe(titleInput)
  })
})
