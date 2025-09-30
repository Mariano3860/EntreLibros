import { BookCard } from '@components/book/BookCard'
import { useBookSearch } from '@hooks/api/useBookSearch'
import { usePublishBook } from '@hooks/api/usePublishBook'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { usePublishDraft } from '@hooks/usePublishDraft'
import { stripDraftMeta } from '@utils/drafts'
import { isEqual } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { PublishBookPayload } from '@src/api/books/publishBook.types'
import { ApiBookSearchResult } from '@src/api/books/searchBooks.types'

import styles from './PublishBookModal.module.scss'
import {
  PublishBookDraftState,
  PublishBookFormState,
  PublishBookImage,
  PublishBookMetadata,
  PublishBookOffer,
  PublishBookStep,
} from './PublishBookModal.types'

const STORAGE_KEY = 'entrelibros.publish.draft'

const initialMetadata: PublishBookMetadata = {
  title: '',
  author: '',
  publisher: '',
  year: '',
  language: '',
  format: '',
  isbn: '',
  coverUrl: '',
}

const initialOffer: PublishBookOffer = {
  sale: false,
  donation: false,
  trade: false,
  priceAmount: '',
  priceCurrency: 'ARS',
  condition: '',
  tradePreferences: [],
  notes: '',
  availability: 'public',
  delivery: {
    nearBookCorner: true,
    inPerson: true,
    shipping: false,
    shippingPayer: 'owner',
  },
}

const initialState: PublishBookFormState = {
  metadata: initialMetadata,
  offer: initialOffer,
  images: [],
  manualMode: false,
  searchQuery: '',
  step: 'identify',
  acceptedTerms: false,
}

const MAX_IMAGES = 5

const genres = [
  'fiction',
  'nonfiction',
  'fantasy',
  'history',
  'science',
  'romance',
  'selfHelp',
]

type PublishBookModalProps = {
  isOpen: boolean
  onClose: () => void
  onPublished: (bookId: string) => void
}

const toSerializableDraft = (
  state: PublishBookFormState
): PublishBookDraftState => ({
  ...state,
  images: state.images.map(({ id, url, source, name }) => ({
    id,
    url,
    source,
    name,
  })),
})

const sanitizeDraft = (
  draft: PublishBookDraftState | null
): PublishBookFormState => {
  if (!draft) return initialState
  return {
    ...initialState,
    ...draft,
    metadata: { ...initialMetadata, ...draft.metadata },
    offer: { ...initialOffer, ...draft.offer },
  }
}

const ensureCover = (images: PublishBookImage[], coverUrl?: string) => {
  if (coverUrl && !images.some((image) => image.source === 'cover')) {
    return [
      {
        id: `cover-${Date.now()}`,
        url: coverUrl,
        source: 'cover' as const,
      },
      ...images,
    ]
  }
  return images
}

const getPreviewCover = (images: PublishBookImage[], fallback?: string) => {
  if (images.length === 0) return fallback ?? ''
  const cover = images.find((image) => image.source === 'cover')
  return (cover ?? images[0]).url
}

const useDebouncedValue = (value: string, delay = 400) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

export const PublishBookModal: React.FC<PublishBookModalProps> = ({
  isOpen,
  onClose,
  onPublished,
}) => {
  const { t, i18n } = useTranslation()
  const {
    draft: storedDraft,
    saveNow,
    scheduleSave,
    clear,
  } = usePublishDraft<PublishBookDraftState>({ storageKey: STORAGE_KEY })
  const draft = useMemo(() => stripDraftMeta(storedDraft), [storedDraft])
  const [state, setState] = useState<PublishBookFormState>(initialState)
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(() => !draft)
  const modalRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const baselineDraft = useMemo<PublishBookDraftState>(
    () => draft ?? toSerializableDraft(initialState),
    [draft]
  )
  const serializableState = useMemo<PublishBookDraftState>(
    () => toSerializableDraft(state),
    [state]
  )

  const debouncedQuery = useDebouncedValue(state.searchQuery)
  const {
    data: results,
    isFetching,
    isError,
    refetch,
  } = useBookSearch(debouncedQuery)

  const { mutateAsync, isPending } = usePublishBook()

  const baseState = useMemo(() => sanitizeDraft(draft), [draft])

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false
      setShowDraftPrompt(false)
      setAutosaveEnabled(true)
      return
    }

    if (initializedRef.current) return

    initializedRef.current = true
    if (draft) {
      setShowDraftPrompt(true)
      setAutosaveEnabled(false)
    } else {
      setState(initialState)
      setAutosaveEnabled(true)
    }
  }, [draft, isOpen])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const closeWithConfirmation = () => {
    const hasChanges = !isEqual(serializableState, baselineDraft)
    if (hasChanges) {
      const confirmed = window.confirm(t('publishBook.confirmClose'))
      if (!confirmed) {
        return
      }
    }
    onClose()
  }

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen && !showDraftPrompt,
    onEscape: closeWithConfirmation,
  })

  useEffect(() => {
    if (!isOpen) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isEqual(serializableState, baselineDraft)) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [baselineDraft, isOpen, serializableState])

  useEffect(() => {
    if (!isOpen || showDraftPrompt || !autosaveEnabled) return
    if (isEqual(serializableState, baselineDraft)) return
    scheduleSave(serializableState)
  }, [
    autosaveEnabled,
    baselineDraft,
    isOpen,
    scheduleSave,
    serializableState,
    showDraftPrompt,
  ])

  const updateMetadata = (update: Partial<PublishBookMetadata>) => {
    setAutosaveEnabled(true)
    setState((prev) => {
      const metadata = { ...prev.metadata, ...update }
      const nextImages = ensureCover(prev.images, metadata.coverUrl)
      return { ...prev, metadata, images: nextImages }
    })
  }

  const updateOffer = (update: Partial<PublishBookOffer>) => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      offer: { ...prev.offer, ...update },
    }))
  }

  const updateDelivery = (update: Partial<PublishBookOffer['delivery']>) => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      offer: { ...prev.offer, delivery: { ...prev.offer.delivery, ...update } },
    }))
  }

  const handleResult = (result: ApiBookSearchResult) => {
    setState((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        title: result.title ?? prev.metadata.title,
        author: result.author ?? prev.metadata.author,
        publisher: result.publisher ?? prev.metadata.publisher,
        year: result.year ? String(result.year) : prev.metadata.year,
        language:
          result.language ?? prev.metadata.language ?? i18n.language ?? '',
        format: result.format ?? prev.metadata.format,
        isbn: result.isbn ?? prev.metadata.isbn,
        coverUrl: result.coverUrl ?? prev.metadata.coverUrl,
      },
      manualMode: false,
      images: ensureCover(
        prev.images,
        result.coverUrl ?? prev.metadata.coverUrl
      ),
    }))
    toast.info(t('publishBook.prefilled'))
    setAutosaveEnabled(true)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files).slice(0, MAX_IMAGES)
    const uploads: PublishBookImage[] = await Promise.all(
      fileArray.map(
        (file, index) =>
          new Promise<PublishBookImage>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () =>
              resolve({
                id: `${file.name}-${Date.now()}-${index}`,
                url: String(reader.result),
                source: 'upload',
                name: file.name,
              })
            reader.onerror = () =>
              reject(reader.error ?? new Error('Failed to read file'))
            reader.readAsDataURL(file)
          })
      )
    )
    setState((prev) => {
      const nextImages = [...prev.images, ...uploads].slice(0, MAX_IMAGES)
      return { ...prev, images: nextImages }
    })
    setAutosaveEnabled(true)
  }

  const removeImage = (id: string) => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== id),
    }))
  }

  const nextStep = () => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'identify' ? 'offer' : 'review',
    }))
  }

  const previousStep = () => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'review' ? 'offer' : 'identify',
    }))
  }

  const imagesCount = state.images.length
  const coverUrl = getPreviewCover(state.images, state.metadata.coverUrl)

  const identifyErrors: Record<string, string> = {}
  if (!state.metadata.title.trim()) {
    identifyErrors.title = t('publishBook.errors.title')
  }
  if (!state.metadata.author.trim()) {
    identifyErrors.author = t('publishBook.errors.author')
  }
  if (!state.metadata.language.trim()) {
    identifyErrors.language = t('publishBook.errors.language')
  }
  if (!state.metadata.format.trim()) {
    identifyErrors.format = t('publishBook.errors.format')
  }
  if (!coverUrl) {
    identifyErrors.images = t('publishBook.errors.image')
  }

  const canProceedIdentify = Object.keys(identifyErrors).length === 0

  const offerErrors: Record<string, string> = {}
  if (!state.offer.condition) {
    offerErrors.condition = t('publishBook.errors.condition')
  }
  if (!state.offer.sale && !state.offer.trade && !state.offer.donation) {
    offerErrors.modes = t('publishBook.errors.modes')
  }
  if (state.offer.sale) {
    const amount = Number(state.offer.priceAmount)
    if (!state.offer.priceAmount || Number.isNaN(amount) || amount <= 0) {
      offerErrors.price = t('publishBook.errors.price')
    }
  }

  const canProceedOffer = Object.keys(offerErrors).length === 0

  const publishDisabled = !state.acceptedTerms || isPending

  const saveDraft = () => {
    setAutosaveEnabled(true)
    saveNow(serializableState)
    toast.success(t('publishBook.draftSaved'))
  }

  const handlePublish = async () => {
    const payload: PublishBookPayload = {
      metadata: {
        title: state.metadata.title,
        author: state.metadata.author,
        publisher: state.metadata.publisher || undefined,
        year: state.metadata.year ? Number(state.metadata.year) : null,
        language: state.metadata.language || undefined,
        format: state.metadata.format || undefined,
        isbn: state.metadata.isbn || undefined,
        coverUrl,
      },
      images: state.images.map((image) => ({
        id: image.id,
        url: image.url,
        source: image.source,
      })),
      offer: {
        sale: state.offer.sale,
        donation: state.offer.donation,
        trade: state.offer.trade,
        price: state.offer.sale
          ? {
              amount: Number(state.offer.priceAmount),
              currency: state.offer.priceCurrency,
            }
          : null,
        condition: state.offer
          .condition as PublishBookPayload['offer']['condition'],
        tradePreferences: state.offer.tradePreferences,
        notes: state.offer.notes || undefined,
        availability: state.offer.availability,
        delivery: state.offer.delivery,
      },
      draft: false,
    }

    try {
      const created = await mutateAsync(payload)
      toast.success(t('publishBook.published'))
      clear()
      onPublished(created.id)
    } catch (error) {
      console.error('Failed to publish book', error)
      toast.error(t('publishBook.publishError'))
    }
  }

  const stepIndex: Record<PublishBookStep, number> = {
    identify: 0,
    offer: 1,
    review: 2,
  }

  const resumeDraft = () => {
    setState(baseState)
    setShowDraftPrompt(false)
    setAutosaveEnabled(true)
  }

  const discardDraft = () => {
    clear()
    setState(initialState)
    setShowDraftPrompt(false)
    setAutosaveEnabled(true)
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} role="presentation" aria-hidden={!isOpen}>
      {showDraftPrompt ? (
        <div className={styles.resumePrompt} role="dialog" aria-modal="true">
          <h2>{t('publishBook.resume.title')}</h2>
          <p>{t('publishBook.resume.description')}</p>
          <div className={styles.resumeActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={discardDraft}
            >
              {t('publishBook.resume.discard')}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={resumeDraft}
            >
              {t('publishBook.resume.continue')}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-book-title"
          ref={modalRef}
        >
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <h2 id="publish-book-title">{t('publishBook.title')}</h2>
              <span className={styles.toastInline}>
                {t('publishBook.subtitle')}
              </span>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeWithConfirmation}
              >
                {t('publishBook.cancel')}
              </button>
            </div>
          </header>

          <section className={styles.content}>
            <div
              className={styles.stepper}
              role="tablist"
              aria-label={t('publishBook.progress')}
            >
              {(['identify', 'offer', 'review'] as PublishBookStep[]).map(
                (step) => (
                  <div key={step} className={styles.step}>
                    <span
                      className={`${styles.stepIndicator} ${
                        step === state.step ? styles.stepActive : ''
                      }`.trim()}
                      aria-hidden="true"
                    >
                      {stepIndex[step] + 1}
                    </span>
                    <div>
                      <div className={styles.stepLabel}>
                        {t(`publishBook.steps.${step}.title`)}
                      </div>
                      <div className={styles.stepDescription}>
                        {t(`publishBook.steps.${step}.description`)}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className={styles.stepContent}>
              {state.step === 'identify' && (
                <div className={styles.stepLayout}>
                  <div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-search">
                        {t('publishBook.search.label')}
                      </label>
                      <input
                        id="publish-search"
                        type="search"
                        className={styles.input}
                        placeholder={t('publishBook.search.placeholder') ?? ''}
                        value={state.searchQuery}
                        onChange={(event) =>
                          setState((prev) => ({
                            ...prev,
                            searchQuery: event.target.value,
                          }))
                        }
                        onBlur={() => saveNow(serializableState)}
                      />
                    </div>
                    {isFetching && (
                      <div className={styles.loadingRow} role="status">
                        <span className={styles.spinner} aria-hidden />
                        <span>{t('publishBook.search.loading')}</span>
                      </div>
                    )}
                    {isError && (
                      <div className={styles.error} role="alert">
                        {t('publishBook.search.error')}{' '}
                        <button
                          type="button"
                          className={styles.ghostButton}
                          onClick={() => refetch()}
                        >
                          {t('publishBook.search.retry')}
                        </button>
                      </div>
                    )}
                    {results && results.length === 0 && (
                      <p className={styles.toastInline}>
                        {t('publishBook.search.empty')}
                      </p>
                    )}
                    {results && results.length > 0 && (
                      <div className={styles.searchResults}>
                        {results.map((book) => (
                          <div key={book.id} className={styles.searchResult}>
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt={t('publishBook.search.cover', {
                                  title: book.title,
                                })}
                                className={styles.searchCover}
                              />
                            ) : (
                              <div
                                className={styles.searchCover}
                                aria-hidden="true"
                              />
                            )}
                            <div className={styles.searchMeta}>
                              <strong>{book.title}</strong>
                              <span>
                                {book.author}
                                {book.year ? ` · ${book.year}` : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={styles.searchButton}
                              onClick={() => handleResult(book)}
                            >
                              {t('publishBook.search.use')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.manualToggle}>
                      <input
                        type="checkbox"
                        id="publish-manual"
                        checked={state.manualMode}
                        onChange={(event) =>
                          setState((prev) => ({
                            ...prev,
                            manualMode: event.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor="publish-manual"
                        className={styles.switchLabel}
                      >
                        {t('publishBook.manualToggle')}
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-title">
                        {t('publishBook.fields.title')}
                      </label>
                      <input
                        id="publish-title"
                        className={styles.input}
                        value={state.metadata.title}
                        onChange={(event) =>
                          updateMetadata({ title: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                        required
                        aria-invalid={identifyErrors.title ? 'true' : 'false'}
                      />
                      {identifyErrors.title && (
                        <span className={styles.error} role="alert">
                          {identifyErrors.title}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-author">
                        {t('publishBook.fields.author')}
                      </label>
                      <input
                        id="publish-author"
                        className={styles.input}
                        value={state.metadata.author}
                        onChange={(event) =>
                          updateMetadata({ author: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                        required
                        aria-invalid={identifyErrors.author ? 'true' : 'false'}
                      />
                      {identifyErrors.author && (
                        <span className={styles.error} role="alert">
                          {identifyErrors.author}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-language">
                        {t('publishBook.fields.language')}
                      </label>
                      <input
                        id="publish-language"
                        className={styles.input}
                        value={state.metadata.language}
                        onChange={(event) =>
                          updateMetadata({ language: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                        required
                        aria-invalid={
                          identifyErrors.language ? 'true' : 'false'
                        }
                      />
                      {identifyErrors.language && (
                        <span className={styles.error} role="alert">
                          {identifyErrors.language}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-format">
                        {t('publishBook.fields.format')}
                      </label>
                      <input
                        id="publish-format"
                        className={styles.input}
                        value={state.metadata.format}
                        onChange={(event) =>
                          updateMetadata({ format: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                        required
                        aria-invalid={identifyErrors.format ? 'true' : 'false'}
                      />
                      {identifyErrors.format && (
                        <span className={styles.error} role="alert">
                          {identifyErrors.format}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-publisher">
                        {t('publishBook.fields.publisher')}
                      </label>
                      <input
                        id="publish-publisher"
                        className={styles.input}
                        value={state.metadata.publisher}
                        onChange={(event) =>
                          updateMetadata({ publisher: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-year">
                        {t('publishBook.fields.year')}
                      </label>
                      <input
                        id="publish-year"
                        className={styles.input}
                        value={state.metadata.year}
                        onChange={(event) =>
                          updateMetadata({ year: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                        inputMode="numeric"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="publish-isbn">
                        {t('publishBook.fields.isbn')}
                      </label>
                      <input
                        id="publish-isbn"
                        className={styles.input}
                        value={state.metadata.isbn}
                        onChange={(event) =>
                          updateMetadata({ isbn: event.target.value })
                        }
                        onBlur={() => saveNow(serializableState)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className={styles.formGroup}>
                      <label>{t('publishBook.fields.images')}</label>
                      <div
                        className={styles.uploader}
                        role="group"
                        onDragOver={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onDrop={(event) => {
                          event.preventDefault()
                          handleFiles(event.dataTransfer.files)
                        }}
                      >
                        <p>{t('publishBook.uploader.title')}</p>
                        <span className={styles.uploadHint}>
                          {t('publishBook.uploader.hint', {
                            count: MAX_IMAGES,
                          })}
                        </span>
                        <label
                          className={styles.uploadButton}
                          htmlFor="publish-upload"
                        >
                          {t('publishBook.uploader.cta')}
                        </label>
                        <input
                          id="publish-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) => handleFiles(event.target.files)}
                        />
                      </div>
                      {identifyErrors.images && (
                        <span className={styles.error} role="alert">
                          {identifyErrors.images}
                        </span>
                      )}
                    </div>
                    {imagesCount > 0 && (
                      <div className={styles.previews}>
                        {state.images.map((image) => (
                          <figure key={image.id} className={styles.previewItem}>
                            <img
                              src={image.url}
                              alt={t('publishBook.previewAlt')}
                            />
                            <button
                              type="button"
                              className={styles.removePreview}
                              onClick={() => removeImage(image.id)}
                              aria-label={
                                t('publishBook.uploader.remove') ?? ''
                              }
                            >
                              ×
                            </button>
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {state.step === 'offer' && (
                <div className={styles.stepLayout}>
                  <div className={styles.formGroup}>
                    <label>{t('publishBook.offer.modes.label')}</label>
                    <div className={styles.checkboxGroup}>
                      {(['trade', 'sale', 'donation'] as const).map((mode) => (
                        <label key={mode} className={styles.checkboxRow}>
                          <input
                            type="checkbox"
                            checked={state.offer[mode]}
                            onChange={(event) =>
                              updateOffer({ [mode]: event.target.checked })
                            }
                          />
                          <span>{t(`publishBook.offer.modes.${mode}`)}</span>
                        </label>
                      ))}
                    </div>
                    {offerErrors.modes && (
                      <span className={styles.error} role="alert">
                        {offerErrors.modes}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('publishBook.offer.condition.label')}</label>
                    <div className={styles.radioGroup}>
                      {(
                        ['new', 'very_good', 'good', 'acceptable'] as const
                      ).map((condition) => (
                        <label key={condition} className={styles.radioRow}>
                          <input
                            type="radio"
                            name="publish-condition"
                            value={condition}
                            checked={state.offer.condition === condition}
                            onChange={() => updateOffer({ condition })}
                          />
                          <span>
                            {t(
                              `publishBook.offer.condition.options.${condition}`
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                    {offerErrors.condition && (
                      <span className={styles.error} role="alert">
                        {offerErrors.condition}
                      </span>
                    )}
                  </div>

                  {state.offer.sale && (
                    <div className={styles.priceGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="publish-price">
                          {t('publishBook.offer.price.label')}
                        </label>
                        <input
                          id="publish-price"
                          className={styles.input}
                          inputMode="decimal"
                          value={state.offer.priceAmount}
                          onChange={(event) =>
                            updateOffer({ priceAmount: event.target.value })
                          }
                          onBlur={() => saveNow(serializableState)}
                          aria-invalid={offerErrors.price ? 'true' : 'false'}
                        />
                        {offerErrors.price && (
                          <span className={styles.error} role="alert">
                            {offerErrors.price}
                          </span>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="publish-currency">
                          {t('publishBook.offer.price.currency')}
                        </label>
                        <select
                          id="publish-currency"
                          className={styles.select}
                          value={state.offer.priceCurrency}
                          onChange={(event) =>
                            updateOffer({ priceCurrency: event.target.value })
                          }
                        >
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {state.offer.trade && (
                    <div className={styles.formGroup}>
                      <label>{t('publishBook.offer.trade.label')}</label>
                      <div className={styles.badgeRow}>
                        {genres.map((genre) => {
                          const isActive =
                            state.offer.tradePreferences.includes(genre)
                          return (
                            <button
                              key={genre}
                              type="button"
                              className={`${styles.badge} ${
                                isActive ? styles.badgeActive : ''
                              }`.trim()}
                              onClick={() => {
                                setState((prev) => {
                                  const tradePreferences = isActive
                                    ? prev.offer.tradePreferences.filter(
                                        (item) => item !== genre
                                      )
                                    : [...prev.offer.tradePreferences, genre]
                                  return {
                                    ...prev,
                                    offer: { ...prev.offer, tradePreferences },
                                  }
                                })
                              }}
                            >
                              {t(`publishBook.offer.trade.genres.${genre}`)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="publish-notes">
                      {t('publishBook.offer.notes.label')}
                    </label>
                    <textarea
                      id="publish-notes"
                      className={styles.textarea}
                      value={state.offer.notes}
                      maxLength={300}
                      onChange={(event) =>
                        updateOffer({ notes: event.target.value })
                      }
                      onBlur={() => saveNow(serializableState)}
                    />
                    <span className={styles.toastInline}>
                      {t('publishBook.offer.notes.counter', {
                        count: state.offer.notes.length,
                      })}
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('publishBook.offer.availability.label')}</label>
                    <div className={styles.radioGroup}>
                      {(['public', 'private'] as const).map((mode) => (
                        <label key={mode} className={styles.radioRow}>
                          <input
                            type="radio"
                            name="publish-availability"
                            value={mode}
                            checked={state.offer.availability === mode}
                            onChange={() => updateOffer({ availability: mode })}
                          />
                          <span>
                            {t(
                              `publishBook.offer.availability.options.${mode}`
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('publishBook.offer.delivery.label')}</label>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={state.offer.delivery.nearBookCorner}
                          onChange={(event) =>
                            updateDelivery({
                              nearBookCorner: event.target.checked,
                            })
                          }
                        />
                        <span>
                          {t(
                            'publishBook.offer.delivery.options.nearBookCorner'
                          )}
                        </span>
                      </label>
                      <label className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={state.offer.delivery.inPerson}
                          onChange={(event) =>
                            updateDelivery({ inPerson: event.target.checked })
                          }
                        />
                        <span>
                          {t('publishBook.offer.delivery.options.inPerson')}
                        </span>
                      </label>
                      <label className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={state.offer.delivery.shipping}
                          onChange={(event) =>
                            updateDelivery({ shipping: event.target.checked })
                          }
                        />
                        <span>
                          {t('publishBook.offer.delivery.options.shipping')}
                        </span>
                      </label>
                    </div>
                    {state.offer.delivery.shipping && (
                      <div className={styles.formGroup}>
                        <label htmlFor="publish-shipping-payer">
                          {t('publishBook.offer.delivery.shippingPayer.label')}
                        </label>
                        <select
                          id="publish-shipping-payer"
                          className={styles.select}
                          value={state.offer.delivery.shippingPayer}
                          onChange={(event) =>
                            updateDelivery({
                              shippingPayer: event.target
                                .value as PublishBookOffer['delivery']['shippingPayer'],
                            })
                          }
                        >
                          <option value="owner">
                            {t(
                              'publishBook.offer.delivery.shippingPayer.owner'
                            )}
                          </option>
                          <option value="requester">
                            {t(
                              'publishBook.offer.delivery.shippingPayer.requester'
                            )}
                          </option>
                          <option value="split">
                            {t(
                              'publishBook.offer.delivery.shippingPayer.split'
                            )}
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {state.step === 'review' && (
                <div className={styles.stepLayout}>
                  <div className={styles.reviewCardWrapper}>
                    <BookCard
                      title={state.metadata.title}
                      author={state.metadata.author}
                      coverUrl={coverUrl}
                      condition={t(
                        `publishBook.preview.condition.${state.offer.condition}`
                      )}
                      status="available"
                      isForSale={state.offer.sale}
                      price={
                        state.offer.sale
                          ? Number(state.offer.priceAmount)
                          : undefined
                      }
                      isForTrade={state.offer.trade}
                      tradePreferences={state.offer.tradePreferences.map(
                        (genre) => t(`publishBook.offer.trade.genres.${genre}`)
                      )}
                      isSeeking={false}
                    />
                  </div>

                  <div className={styles.checklist}>
                    <label className={styles.checklistItem}>
                      <input
                        type="checkbox"
                        checked={state.acceptedTerms}
                        onChange={(event) =>
                          setState((prev) => ({
                            ...prev,
                            acceptedTerms: event.target.checked,
                          }))
                        }
                      />
                      <span>{t('publishBook.review.terms')}</span>
                    </label>
                    <p className={styles.toastInline}>
                      {t('publishBook.review.hint')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer className={styles.actions}>
            <div className={styles.ctaGroup}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeWithConfirmation}
              >
                {t('publishBook.cancel')}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={saveDraft}
              >
                {t('publishBook.saveDraft')}
              </button>
            </div>

            <div className={styles.ctaGroup}>
              {state.step !== 'identify' && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={previousStep}
                >
                  {t('publishBook.back')}
                </button>
              )}
              {state.step !== 'review' && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={nextStep}
                  disabled={
                    (state.step === 'identify' && !canProceedIdentify) ||
                    (state.step === 'offer' && !canProceedOffer)
                  }
                >
                  {t('publishBook.next')}
                </button>
              )}
              {state.step === 'review' && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handlePublish}
                  disabled={publishDisabled}
                >
                  {isPending
                    ? t('publishBook.publishing')
                    : t('publishBook.publish')}
                </button>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
