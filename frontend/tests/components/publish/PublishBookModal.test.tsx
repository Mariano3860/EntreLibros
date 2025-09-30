import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DraftWithMeta } from '@utils/drafts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PublishBookModal } from '@components/publish/PublishBookModal/PublishBookModal'
import { PublishBookDraftState } from '@components/publish/PublishBookModal/PublishBookModal.types'
import { ApiBookSearchResult } from '@src/api/books/searchBooks.types'

const { mockUseFocusTrap } = vi.hoisted(() => ({
  mockUseFocusTrap: vi.fn(),
}))
vi.mock('@hooks/useFocusTrap', () => ({
  useFocusTrap: mockUseFocusTrap,
}))

type MockDraftApi = {
  draft: DraftWithMeta<PublishBookDraftState> | null
  saveNow: ReturnType<typeof vi.fn>
  scheduleSave: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

const { mockUsePublishDraft } = vi.hoisted(() => ({
  mockUsePublishDraft: vi.fn(),
}))
let draftApi: MockDraftApi
vi.mock('@hooks/usePublishDraft', () => ({
  usePublishDraft: (...args: unknown[]) => mockUsePublishDraft(...args),
}))

const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}))
vi.mock('@hooks/api/usePublishBook', () => ({
  usePublishBook: () => ({ mutateAsync, isPending: false }),
}))

const { useBookSearchMock } = vi.hoisted(() => ({
  useBookSearchMock: vi.fn(
    (
      query: string
    ): {
      data: ApiBookSearchResult[]
      isFetching: boolean
      isError: boolean
      refetch: () => void
    } => ({
      data: query.trim().length >= 3 ? [sampleResult] : [],
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
  ),
}))
vi.mock('@hooks/api/useBookSearch', () => ({
  useBookSearch: (query: string) => useBookSearchMock(query),
}))

const { toastInfo, toastSuccess, toastError } = vi.hoisted(() => ({
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('react-toastify', () => ({
  toast: {
    info: (...args: unknown[]) => toastInfo(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

const sampleResult: ApiBookSearchResult = {
  id: '1984',
  title: '1984',
  author: 'George Orwell',
  publisher: 'Secker & Warburg',
  year: 1949,
  language: 'ES',
  format: 'Tapa blanda',
  isbn: '9780451524935',
  coverUrl: 'https://example.com/1984.jpg',
}

const renderModal = () => {
  const onClose = vi.fn()
  const onPublished = vi.fn()
  const result = render(
    <PublishBookModal isOpen onClose={onClose} onPublished={onPublished} />
  )
  return { ...result, onClose, onPublished }
}

const applyDraft = (draft: PublishBookDraftState) => {
  draftApi.draft = {
    ...draft,
    updatedAt: Date.now(),
  }
  mockUsePublishDraft.mockReturnValue(draftApi)
}

const baseDraftState: PublishBookDraftState = {
  metadata: {
    title: 'El eterno',
    author: 'Ana Autora',
    publisher: 'Editorial Azul',
    year: '2022',
    language: 'ES',
    format: 'Tapa dura',
    isbn: '12345',
    coverUrl: 'https://example.com/cover.jpg',
  },
  offer: {
    sale: true,
    donation: false,
    trade: false,
    priceAmount: '1500',
    priceCurrency: 'ARS',
    condition: 'good',
    tradePreferences: ['fiction'],
    notes: 'Casi nuevo',
    availability: 'public',
    delivery: {
      nearBookCorner: true,
      inPerson: true,
      shipping: false,
      shippingPayer: 'owner',
    },
  },
  images: [
    {
      id: 'cover-1',
      url: 'https://example.com/cover.jpg',
      source: 'cover',
      name: 'cover.jpg',
    },
  ],
  manualMode: false,
  searchQuery: '',
  step: 'identify',
  acceptedTerms: true,
}

describe('PublishBookModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    toastInfo.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    mockUseFocusTrap.mockReset()
    useBookSearchMock.mockClear()
    draftApi = {
      draft: null,
      saveNow: vi.fn(),
      scheduleSave: vi.fn(),
      clear: vi.fn(),
    }
    mockUsePublishDraft.mockReturnValue(draftApi)
  })

  test('shows resume prompt and resumes stored draft', async () => {
    applyDraft(baseDraftState)

    const { onClose } = renderModal()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('publishBook.resume.title')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishBook.resume.continue' })
    )

    await waitFor(() =>
      expect(
        screen.queryByText('publishBook.resume.title')
      ).not.toBeInTheDocument()
    )

    expect(screen.getByLabelText('publishBook.fields.title')).toHaveValue(
      'El eterno'
    )
  })

  test('discarding draft clears storage and resets fields', async () => {
    applyDraft(baseDraftState)

    renderModal()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishBook.resume.discard' })
    )

    await waitFor(() => expect(draftApi.clear).toHaveBeenCalled())
    expect(screen.getByLabelText('publishBook.fields.title')).toHaveValue('')
  })

  test('save draft triggers persistence feedback', () => {
    renderModal()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishBook.saveDraft' })
    )

    expect(draftApi.saveNow).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith('publishBook.draftSaved')
  })

  test('allows toggling manual mode to edit metadata manually', () => {
    renderModal()

    const manualToggle = screen.getByLabelText('publishBook.manualToggle')
    expect(manualToggle).not.toBeChecked()

    fireEvent.click(manualToggle)
    expect(manualToggle).toBeChecked()

    const titleInput = screen.getByLabelText('publishBook.fields.title')
    fireEvent.change(titleInput, { target: { value: 'Manual entry' } })

    expect(titleInput).toHaveValue('Manual entry')
  })

  test('removes existing images from a resumed draft', async () => {
    applyDraft(baseDraftState)

    renderModal()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishBook.resume.continue' })
    )

    const removeButtons = await screen.findAllByLabelText(
      'publishBook.uploader.remove'
    )
    expect(removeButtons).toHaveLength(1)

    fireEvent.click(removeButtons[0])

    await waitFor(() =>
      expect(
        screen.queryByLabelText('publishBook.uploader.remove')
      ).not.toBeInTheDocument()
    )
  })

  test('asks for confirmation before closing when changes exist', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { onClose } = renderModal()

    fireEvent.change(screen.getByLabelText('publishBook.fields.title'), {
      target: { value: 'Con cambios' },
    })

    const [headerCancel, footerCancel] = screen.getAllByRole('button', {
      name: 'publishBook.cancel',
    })

    fireEvent.click(headerCancel)

    expect(confirmSpy).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    fireEvent.click(footerCancel)

    expect(onClose).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  test('handles image uploads via the file picker', async () => {
    const originalFileReader = globalThis.FileReader
    class FileReaderMock {
      public result: string | ArrayBuffer | null = null
      public onload: null | ((event: ProgressEvent<FileReader>) => void) = null
      public onerror: null | ((event: ProgressEvent<FileReader>) => void) = null
      readAsDataURL(file: Blob) {
        this.result = `data-url-${(file as File).name}`
        this.onload?.({} as ProgressEvent<FileReader>)
      }
    }
    // @ts-expect-error - jsdom FileReader signature is not fully typed for mocks
    globalThis.FileReader = FileReaderMock

    try {
      renderModal()

      const fileInput = screen.getByLabelText('publishBook.uploader.cta', {
        selector: 'input',
      }) as HTMLInputElement
      const image = new File(['binary'], 'preview.png', { type: 'image/png' })
      await waitFor(() => {
        fireEvent.change(fileInput, {
          target: { files: [image] },
        })
      })

      expect(
        await screen.findByRole('img', { name: 'publishBook.previewAlt' })
      ).toBeInTheDocument()
    } finally {
      globalThis.FileReader = originalFileReader
    }
  })

  test('toggles trade preferences when selecting genres', async () => {
    renderModal()

    fireEvent.change(
      screen.getByPlaceholderText('publishBook.search.placeholder'),
      { target: { value: '1984' } }
    )

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'publishBook.search.use' },
        { timeout: 2000 }
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.next' }))

    const tradeToggle = screen.getByLabelText('publishBook.offer.modes.trade')
    fireEvent.click(tradeToggle)

    const genreChip = screen.getByRole('button', {
      name: 'publishBook.offer.trade.genres.fiction',
    })

    fireEvent.click(genreChip)
    expect(genreChip.className).toMatch(/badgeActive/)

    fireEvent.click(genreChip)
    expect(genreChip.className).not.toMatch(/badgeActive/)
  })

  test('updates delivery options when toggled in the offer step', async () => {
    renderModal()

    fireEvent.change(
      screen.getByPlaceholderText('publishBook.search.placeholder'),
      { target: { value: '1984' } }
    )

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'publishBook.search.use' },
        { timeout: 2000 }
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.next' }))

    const shippingCheckbox = screen.getByLabelText(
      'publishBook.offer.delivery.options.shipping'
    ) as HTMLInputElement
    expect(shippingCheckbox.checked).toBe(false)
    fireEvent.click(shippingCheckbox)
    expect(shippingCheckbox.checked).toBe(true)

    const payerSelect = await screen.findByLabelText(
      'publishBook.offer.delivery.shippingPayer.label'
    )
    fireEvent.change(payerSelect, {
      target: { value: 'requester' },
    })

    expect((payerSelect as HTMLSelectElement).value).toBe('requester')
  })

  test('allows returning to the previous step from review', async () => {
    renderModal()

    fireEvent.change(
      screen.getByPlaceholderText('publishBook.search.placeholder'),
      { target: { value: '1984' } }
    )

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'publishBook.search.use' },
        { timeout: 2000 }
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.next' }))

    fireEvent.click(screen.getByLabelText('publishBook.offer.modes.sale'))
    fireEvent.click(
      screen.getByLabelText('publishBook.offer.condition.options.good')
    )
    fireEvent.change(screen.getByLabelText('publishBook.offer.price.label'), {
      target: { value: '1500' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.next' }))
    fireEvent.click(screen.getByLabelText('publishBook.review.terms'))

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.back' }))

    expect(
      screen.getByText('publishBook.offer.condition.label')
    ).toBeInTheDocument()
  })

  test('publishes book after completing all steps', async () => {
    const { onPublished } = renderModal()

    fireEvent.change(
      screen.getByPlaceholderText('publishBook.search.placeholder'),
      { target: { value: '1984' } }
    )

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'publishBook.search.use' },
        { timeout: 2000 }
      )
    )

    expect(toastInfo).toHaveBeenCalledWith('publishBook.prefilled')

    const nextButton = screen.getByRole('button', { name: 'publishBook.next' })
    await waitFor(() => expect(nextButton).not.toBeDisabled())
    fireEvent.click(nextButton)

    fireEvent.click(screen.getByLabelText('publishBook.offer.modes.sale'))
    fireEvent.click(
      screen.getByLabelText('publishBook.offer.condition.options.good')
    )
    fireEvent.change(screen.getByLabelText('publishBook.offer.price.label'), {
      target: { value: '1700' },
    })

    const nextOfferButton = screen.getByRole('button', {
      name: 'publishBook.next',
    })
    await waitFor(() => expect(nextOfferButton).not.toBeDisabled())
    fireEvent.click(nextOfferButton)

    fireEvent.click(screen.getByLabelText('publishBook.review.terms'))

    mutateAsync.mockResolvedValueOnce({
      id: 'book-123',
      title: '1984',
      author: 'George Orwell',
      coverUrl: sampleResult.coverUrl ?? '',
      condition: 'good',
      status: 'available',
      isForSale: true,
      price: 1700,
      isForTrade: false,
      tradePreferences: [],
      isSeeking: false,
    })

    fireEvent.click(screen.getByRole('button', { name: 'publishBook.publish' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    expect(draftApi.clear).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith('publishBook.published')
    expect(onPublished).toHaveBeenCalledWith('book-123')
  })

  test('shows error toast when publish request fails', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('network'))

    renderModal()

    fireEvent.change(
      screen.getByPlaceholderText('publishBook.search.placeholder'),
      { target: { value: '1984' } }
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'publishBook.search.use' })
    )

    const nextIdentify = screen.getByRole('button', {
      name: 'publishBook.next',
    })
    await waitFor(() => expect(nextIdentify).not.toBeDisabled())
    fireEvent.click(nextIdentify)

    fireEvent.click(screen.getByLabelText('publishBook.offer.modes.sale'))
    fireEvent.click(
      screen.getByLabelText('publishBook.offer.condition.options.good')
    )
    fireEvent.change(screen.getByLabelText('publishBook.offer.price.label'), {
      target: { value: '1700' },
    })

    const nextOffer = screen.getByRole('button', { name: 'publishBook.next' })
    await waitFor(() => expect(nextOffer).not.toBeDisabled())
    fireEvent.click(nextOffer)

    fireEvent.click(screen.getByLabelText('publishBook.review.terms'))
    fireEvent.click(screen.getByRole('button', { name: 'publishBook.publish' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    expect(toastError).toHaveBeenCalledWith('publishBook.publishError')
    expect(draftApi.clear).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
  })
})
