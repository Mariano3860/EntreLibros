import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { server } from '@mocks/server'
import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { generatePublication } from '@mocks/handlers/books/fakers/publication.faker'
import { apiRouteMatcher } from '@mocks/handlers/utils'

import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import type { BookDetailModalProps } from '@components/book/BookDetailModal/BookDetailModal.types'
import type { PublicationUpdate } from '@src/api/books/publication.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { renderWithProviders } from '../../../test-utils'

const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('react-toastify', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

const renderModal = (overrideProps?: Partial<BookDetailModalProps>) => {
  const onClose = vi.fn()
  const props: BookDetailModalProps = {
    isOpen: true,
    bookId: '1',
    onClose,
    ...overrideProps,
  }

  return { ...renderWithProviders(<BookDetailModal {...props} />), onClose }
}

describe('BookDetailModal', () => {
  beforeEach(() => {
    setLoggedInState(true)
    toastSuccess.mockReset()
    toastError.mockReset()
  })

  afterEach(() => {
    setLoggedInState(false)
  })

  test('renders loading state and displays book details', async () => {
    renderModal()

    await waitFor(() => {
      expect(screen.getByText('bookDetail.loading')).toBeInTheDocument()
    })

    expect(await screen.findByText('1984')).toBeInTheDocument()
    expect(screen.getByText('George Orwell')).toBeInTheDocument()
    expect(screen.getByText('bookDetail.offer.title')).toBeInTheDocument()
    const mainImage = screen.getByRole('img', {
      name: 'bookDetail.gallery.imageAlt',
    })
    const firstImageUrl = mainImage.getAttribute('src')
    fireEvent.click(
      screen.getByRole('button', { name: 'bookDetail.gallery.next' })
    )
    expect(mainImage.getAttribute('src')).not.toBe(firstImageUrl)
    fireEvent.click(
      screen.getByRole('button', { name: 'bookDetail.gallery.previous' })
    )
    expect(mainImage.getAttribute('src')).toBe(firstImageUrl)
  })

  test('shows searching state instead of available for want listings', async () => {
    server.use(
      http.get(apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`), () =>
        HttpResponse.json({
          ...generatePublication('1'),
          type: 'want',
          isSeeking: true,
          status: 'available',
        })
      )
    )

    renderModal()

    expect(
      await screen.findByText('bookDetail.status.seeking')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('bookDetail.status.available')
    ).not.toBeInTheDocument()
  })

  test('retries fetching details when the request fails', async () => {
    let attempt = 0
    server.use(
      http.get(apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`), () => {
        attempt += 1
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      })
    )

    renderModal({ bookId: '42' })

    const retryButton = await screen.findByRole(
      'button',
      { name: 'bookDetail.retry' },
      { timeout: 5000 }
    )

    expect(attempt).toBe(1)

    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(attempt).toBe(2)
    })

    expect(
      await screen.findByRole('button', { name: 'bookDetail.retry' })
    ).toBeInTheDocument()
  })

  test('allows the owner to edit and save changes', async () => {
    renderModal()

    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    )

    const textboxes = screen.getAllByRole('textbox')
    const titleInput = textboxes[0] as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Nuevo título' } })

    const notesInput = textboxes.at(-1) as HTMLTextAreaElement
    fireEvent.change(notesInput, { target: { value: 'Notas actualizadas' } })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'bookDetail.save',
      })
    )

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith('bookDetail.saved')
    })

    expect(screen.getByText('Nuevo título')).toBeInTheDocument()
    expect(screen.getByText('Notas actualizadas')).toBeInTheDocument()
  })

  test('allows the owner to edit metadata, status and offer settings', async () => {
    const receivedUpdate = vi.fn<(update: PublicationUpdate) => void>()
    server.use(
      http.put(
        apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
        async ({ request }) => {
          const update = (await request.json()) as PublicationUpdate
          receivedUpdate(update)
          const existing = generatePublication('1')
          return HttpResponse.json({
            ...existing,
            ...update,
            offer: {
              ...existing.offer,
              ...update.offer,
              delivery: {
                ...existing.offer.delivery,
                ...update.offer?.delivery,
              },
            },
          })
        }
      )
    )

    renderModal()

    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    )
    fireEvent.change(screen.getByLabelText('bookDetail.fields.publisher'), {
      target: { value: 'Nueva editorial' },
    })
    fireEvent.change(screen.getByLabelText('bookDetail.fields.year'), {
      target: { value: '2026' },
    })
    fireEvent.change(screen.getByLabelText('bookDetail.fields.status'), {
      target: { value: 'available' },
    })
    const tradeCheckbox = screen.getByRole('checkbox', {
      name: 'publishBook.offer.modes.trade',
    }) as HTMLInputElement
    if (!tradeCheckbox.checked) fireEvent.click(tradeCheckbox)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'publishBook.offer.trade.genres.fiction',
      })
    )
    fireEvent.change(
      screen.getByLabelText('publishBook.offer.availability.label'),
      { target: { value: 'private' } }
    )

    const shippingCheckbox = screen.getByRole('checkbox', {
      name: 'publishBook.offer.delivery.options.shipping',
    }) as HTMLInputElement
    if (!shippingCheckbox.checked) fireEvent.click(shippingCheckbox)
    fireEvent.change(
      screen.getByLabelText('publishBook.offer.delivery.shippingPayer.label'),
      { target: { value: 'requester' } }
    )

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'bookDetail.gallery.remove',
      })[0]
    )
    const imageInput = screen.getByLabelText(
      'bookDetail.gallery.add'
    ) as HTMLInputElement
    fireEvent.change(imageInput, {
      target: {
        files: [new File(['image'], 'new-cover.jpg', { type: 'image/jpeg' })],
      },
    })
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'bookDetail.gallery.remove' })
      ).toHaveLength(2)
    )

    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.save' }))

    await waitFor(() => expect(receivedUpdate).toHaveBeenCalledTimes(1))
    expect(receivedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        publisher: 'Nueva editorial',
        year: 2026,
        status: 'available',
        offer: expect.objectContaining({
          availability: 'private',
          tradePreferences: expect.arrayContaining(['fiction']),
          delivery: expect.objectContaining({
            shipping: true,
            shippingPayer: 'requester',
          }),
        }),
        images: expect.arrayContaining([
          expect.objectContaining({
            source: 'upload',
          }),
        ]),
      })
    )
  })

  test('shows an error toast when saving fails', async () => {
    server.use(
      http.put(apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`), () =>
        HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
      )
    )

    renderModal({ bookId: '2' })

    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    )

    const [titleInput] = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(titleInput, { target: { value: 'Cambios inválidos' } })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'bookDetail.save',
      })
    )

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        expect.stringContaining('bookDetail.errors.forbidden')
      )
    })
  })

  test('asks for confirmation when cancelling with unsaved changes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderModal()

    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    )

    const [titleInput] = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(titleInput, { target: { value: 'Título modificado' } })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'bookDetail.cancel',
      })
    )

    expect(confirmSpy).toHaveBeenCalledWith('bookDetail.confirmClose')
    expect(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    ).toBeInTheDocument()

    confirmSpy.mockRestore()
  })

  test('opens the report modal from the book detail modal', async () => {
    server.use(
      http.get(apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`), () =>
        HttpResponse.json({
          ...generatePublication('1'),
          ownerId: '2',
        })
      )
    )

    renderModal({ onStartConversation: vi.fn() })

    fireEvent.click(
      await screen.findByRole('button', { name: /reportar/i })
    )

    expect(
      await screen.findByRole('heading', { name: 'reports.report' })
    ).toBeInTheDocument()
    const reportBackdrop = screen
      .getByRole('heading', { name: 'reports.report' })
      .closest('[role="presentation"]')
    expect(reportBackdrop).not.toBeNull()
  })

  test('calls onClose when Escape is pressed', async () => {
    const { onClose } = renderModal()

    await screen.findByRole('button', { name: 'bookDetail.edit' })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })
})
