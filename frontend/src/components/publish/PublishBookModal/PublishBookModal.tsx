import {
  PublishModal,
  PublishModalAction,
  PublishModalActions,
} from '@components/publish/shared'
import { useBookSearch } from '@hooks/api/useBookSearch'
import { usePublishBook } from '@hooks/api/usePublishBook'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { usePublishDraft } from '@hooks/usePublishDraft'
import { stripDraftMeta } from '@utils/drafts'
import isEqual from 'lodash/isEqual'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { PublishBookPayload } from '@src/api/books/publishBook.types'
import { ApiBookSearchResult } from '@src/api/books/searchBooks.types'
import { MAX_IMAGES_UPLOAD } from '@src/constants/constants'

import { IdentifyStep } from './components/IdentifyStep'
import { OfferStep } from './components/OfferStep'
import { PublishBookStepper } from './components/PublishBookStepper'
import { ResumeDraftPrompt } from './components/ResumeDraftPrompt'
import { ReviewStep } from './components/ReviewStep'
import {
  STORAGE_KEY,
  genres,
  initialState,
  stepOrder,
  toSerializableDraft,
} from './PublishBookModal.constants'
import styles from './PublishBookModal.module.scss'
import {
  PublishBookCorner,
  PublishBookDraftState,
  PublishBookFormState,
  PublishBookImage,
  PublishBookMetadata,
  PublishBookOffer,
} from './PublishBookModal.types'
import {
  ensureCover,
  getPreviewCover,
  sanitizeDraft,
} from './PublishBookModal.utils'
import { useDebouncedValue } from './useDebouncedValue'

type PublishBookModalProps = {
  isOpen: boolean
  onClose: () => void
  onPublished: (bookId: string) => void
}

const usePublishBookDraft = () =>
  usePublishDraft<PublishBookDraftState>({ storageKey: STORAGE_KEY })

const usePublishState = (draft: PublishBookDraftState | null) => {
  const [state, setState] = useState<PublishBookFormState>(initialState)
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(() => !draft)

  return {
    state,
    setState,
    showDraftPrompt,
    setShowDraftPrompt,
    autosaveEnabled,
    setAutosaveEnabled,
  }
}

const useDraftInitialization = (
  isOpen: boolean,
  draft: PublishBookDraftState | null,
  setState: React.Dispatch<React.SetStateAction<PublishBookFormState>>,
  setShowDraftPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  setAutosaveEnabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const initializedRef = useRef(false)

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
  }, [draft, isOpen, setAutosaveEnabled, setShowDraftPrompt, setState])
}

const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
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
  } = usePublishBookDraft()
  const draft = useMemo(() => stripDraftMeta(storedDraft), [storedDraft])
  const {
    state,
    setState,
    showDraftPrompt,
    setShowDraftPrompt,
    autosaveEnabled,
    setAutosaveEnabled,
  } = usePublishState(draft)
  const modalRef = useRef<HTMLDivElement>(null)

  useDraftInitialization(
    isOpen,
    draft,
    setState,
    setShowDraftPrompt,
    setAutosaveEnabled
  )
  useBodyScrollLock(isOpen)

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

  const closeWithConfirmation = useCallback(() => {
    const hasChanges = !isEqual(serializableState, baselineDraft)
    if (hasChanges) {
      const confirmed = window.confirm(t('publishBook.confirmClose'))
      if (!confirmed) {
        return
      }
    }
    onClose()
  }, [baselineDraft, onClose, serializableState, t])

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

  const handleBlur = useCallback<React.FocusEventHandler<HTMLElement>>(() => {
    if (!autosaveEnabled) return
    scheduleSave(serializableState)
  }, [autosaveEnabled, scheduleSave, serializableState])

  const updateMetadata = useCallback(
    (update: Partial<PublishBookMetadata>) => {
      setAutosaveEnabled(true)
      setState((prev) => {
        const metadata = { ...prev.metadata, ...update }
        const nextImages = ensureCover(prev.images, metadata.coverUrl)
        return { ...prev, metadata, images: nextImages }
      })
    },
    [setAutosaveEnabled, setState]
  )

  const updateOffer = useCallback(
    (update: Partial<PublishBookOffer>) => {
      setAutosaveEnabled(true)
      setState((prev) => ({
        ...prev,
        offer: { ...prev.offer, ...update },
      }))
    },
    [setAutosaveEnabled, setState]
  )

  const updateDelivery = useCallback(
    (update: Partial<PublishBookOffer['delivery']>) => {
      setAutosaveEnabled(true)
      setState((prev) => ({
        ...prev,
        offer: {
          ...prev.offer,
          delivery: { ...prev.offer.delivery, ...update },
        },
      }))
    },
    [setAutosaveEnabled, setState]
  )

  const toggleTradePreference = useCallback(
    (genre: PublishBookOffer['tradePreferences'][number]) => {
      setAutosaveEnabled(true)
      setState((prev) => {
        const isActive = prev.offer.tradePreferences.includes(genre)
        const tradePreferences = isActive
          ? prev.offer.tradePreferences.filter((item) => item !== genre)
          : [...prev.offer.tradePreferences, genre]
        return {
          ...prev,
          offer: { ...prev.offer, tradePreferences },
        }
      })
    },
    [setAutosaveEnabled, setState]
  )

  const updateCorner = useCallback(
    (corner: PublishBookCorner | null) => {
      setAutosaveEnabled(true)
      setState((prev) => ({
        ...prev,
        corner,
      }))
    },
    [setAutosaveEnabled, setState]
  )

  const handleResult = useCallback(
    (result: ApiBookSearchResult) => {
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
    },
    [i18n.language, setAutosaveEnabled, setState, t]
  )

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return
      const fileArray = Array.from(files).slice(0, MAX_IMAGES_UPLOAD)
      const uploads = await Promise.all(
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
        const nextImages = [...prev.images, ...uploads].slice(
          0,
          MAX_IMAGES_UPLOAD
        )
        return { ...prev, images: nextImages }
      })
      setAutosaveEnabled(true)
    },
    [setAutosaveEnabled, setState]
  )

  const removeImage = useCallback(
    (id: string) => {
      setAutosaveEnabled(true)
      setState((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image.id !== id),
      }))
    },
    [setAutosaveEnabled, setState]
  )

  const nextStep = useCallback(() => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'identify' ? 'offer' : 'review',
    }))
  }, [setAutosaveEnabled, setState])

  const previousStep = useCallback(() => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'review' ? 'offer' : 'identify',
    }))
  }, [setAutosaveEnabled, setState])

  const coverUrl = useMemo(
    () => getPreviewCover(state.images, state.metadata.coverUrl),
    [state.images, state.metadata.coverUrl]
  )

  const identifyErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!state.metadata.title.trim()) {
      errors.title = t('publishBook.errors.title')
    }
    if (!state.metadata.author.trim()) {
      errors.author = t('publishBook.errors.author')
    }
    if (!state.metadata.language.trim()) {
      errors.language = t('publishBook.errors.language')
    }
    if (!state.metadata.format.trim()) {
      errors.format = t('publishBook.errors.format')
    }
    if (!coverUrl) {
      errors.images = t('publishBook.errors.image')
    }
    return errors
  }, [coverUrl, state.metadata, t])

  const offerErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!state.offer.condition) {
      errors.condition = t('publishBook.errors.condition')
    }
    if (!state.offer.sale && !state.offer.trade && !state.offer.donation) {
      errors.modes = t('publishBook.errors.modes')
    }
    if (state.offer.sale) {
      const amount = Number(state.offer.priceAmount)
      if (!state.offer.priceAmount || Number.isNaN(amount) || amount <= 0) {
        errors.price = t('publishBook.errors.price')
      }
    }
    return errors
  }, [state.offer, t])

  const canProceedIdentify = useMemo(
    () => Object.keys(identifyErrors).length === 0,
    [identifyErrors]
  )
  const canProceedOffer = useMemo(
    () => Object.keys(offerErrors).length === 0,
    [offerErrors]
  )
  const publishDisabled = useMemo(
    () => !state.acceptedTerms || isPending,
    [isPending, state.acceptedTerms]
  )

  const handleSaveDraft = useCallback(() => {
    setAutosaveEnabled(true)
    saveNow(serializableState)
    toast.success(t('publishBook.draftSaved'))
  }, [saveNow, serializableState, setAutosaveEnabled, t])

  const handlePublish = useCallback(async () => {
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
      cornerId: state.corner?.id ?? null,
      draft: false,
    }

    try {
      const created = await mutateAsync(payload)
      toast.success(t('publishBook.published'))
      clear()
      onPublished(created.id)
    } catch {
      toast.error(t('publishBook.publishError'))
    }
  }, [clear, coverUrl, mutateAsync, onPublished, state, t])

  const resumeDraft = useCallback(() => {
    setState(baseState)
    setShowDraftPrompt(false)
    setAutosaveEnabled(true)
  }, [baseState, setAutosaveEnabled, setShowDraftPrompt, setState])

  const discardDraft = useCallback(() => {
    clear()
    setState(initialState)
    setShowDraftPrompt(false)
    setAutosaveEnabled(true)
  }, [clear, setAutosaveEnabled, setShowDraftPrompt, setState])

  const handleSearchChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, searchQuery: value }))
    },
    [setState]
  )

  const handleManualModeToggle = useCallback(
    (checked: boolean) => {
      setState((prev) => ({ ...prev, manualMode: checked }))
    },
    [setState]
  )

  const handleRetrySearch = useCallback(() => {
    void refetch()
  }, [refetch])

  const handleAcceptedTermsChange = useCallback(
    (checked: boolean) => {
      setState((prev) => ({ ...prev, acceptedTerms: checked }))
    },
    [setState]
  )

  const stepperSteps = useMemo(
    () =>
      stepOrder.map((step) => ({
        id: step,
        label: t(`publishBook.steps.${step}.title`),
        description: t(`publishBook.steps.${step}.description`),
      })),
    [t]
  )

  const leftActions = useMemo<PublishModalAction[]>(
    () => [
      {
        label: t('publishBook.cancel'),
        onClick: closeWithConfirmation,
        variant: 'secondary',
      },
      {
        label: t('publishBook.saveDraft'),
        onClick: handleSaveDraft,
        variant: 'secondary',
      },
    ],
    [closeWithConfirmation, handleSaveDraft, t]
  )

  const rightActions = useMemo<PublishModalAction[]>(() => {
    const actions: PublishModalAction[] = []
    if (state.step !== 'identify') {
      actions.push({
        label: t('publishBook.back'),
        onClick: previousStep,
        variant: 'secondary',
      })
    }

    if (state.step !== 'review') {
      actions.push({
        label: t('publishBook.next'),
        onClick: nextStep,
        variant: 'primary',
        disabled:
          (state.step === 'identify' && !canProceedIdentify) ||
          (state.step === 'offer' && !canProceedOffer),
      })
    } else {
      actions.push({
        label: isPending
          ? t('publishBook.publishing')
          : t('publishBook.publish'),
        onClick: handlePublish,
        variant: 'primary',
        disabled: publishDisabled,
      })
    }

    return actions
  }, [
    state.step,
    t,
    previousStep,
    nextStep,
    canProceedIdentify,
    canProceedOffer,
    isPending,
    handlePublish,
    publishDisabled,
  ])

  if (!isOpen) return null

  if (showDraftPrompt) {
    return (
      <div className={styles.overlay} role="presentation" aria-hidden={!isOpen}>
        <ResumeDraftPrompt
          t={t}
          onDiscard={discardDraft}
          onResume={resumeDraft}
        />
      </div>
    )
  }

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('publishBook.title')}
      subtitle={t('publishBook.subtitle')}
      onClose={closeWithConfirmation}
      closeLabel={t('publishBook.cancel')}
      footer={
        <PublishModalActions
          leftActions={leftActions}
          rightActions={rightActions}
        />
      }
    >
      <PublishBookStepper
        steps={stepperSteps}
        currentStep={state.step}
        ariaLabel={t('publishBook.progress')}
      />

      <div className={styles.stepContent}>
        {state.step === 'identify' && (
          <IdentifyStep
            t={t}
            metadata={state.metadata}
            manualMode={state.manualMode}
            searchQuery={state.searchQuery}
            images={state.images}
            errors={identifyErrors}
            results={results}
            isFetching={isFetching}
            isError={isError}
            maxImages={MAX_IMAGES_UPLOAD}
            onMetadataChange={updateMetadata}
            onSearchChange={handleSearchChange}
            onManualModeToggle={handleManualModeToggle}
            onResultSelect={handleResult}
            onFiles={handleFiles}
            onRemoveImage={removeImage}
            onRetry={handleRetrySearch}
            onBlur={handleBlur}
          />
        )}

        {state.step === 'offer' && (
          <OfferStep
            t={t}
            offer={state.offer}
            corner={state.corner}
            errors={offerErrors}
            genres={genres}
            onOfferChange={updateOffer}
            onDeliveryChange={updateDelivery}
            onToggleTradePreference={toggleTradePreference}
            onCornerChange={updateCorner}
            onBlur={handleBlur}
          />
        )}

        {state.step === 'review' && (
          <ReviewStep
            t={t}
            metadata={state.metadata}
            offer={state.offer}
            coverUrl={coverUrl}
            acceptedTerms={state.acceptedTerms}
            onAcceptedTermsChange={handleAcceptedTermsChange}
          />
        )}
      </div>
    </PublishModal>
  )
}
