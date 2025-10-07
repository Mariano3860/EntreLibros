import { useBookDetails } from '@hooks/api/useBookDetails'
import { useUpdateBook } from '@hooks/api/useUpdateBook'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Publication,
  PublicationApiError,
  PublicationAvailability,
  PublicationCondition,
  PublicationImage,
  PublicationStatus,
  PublicationUpdate,
  isPublicationApiError,
} from '@src/api/books/publication.types'
import { PublishModal } from '@src/components/publish/shared/PublishModal/PublishModal'
import { PublishModalActions } from '@src/components/publish/shared/PublishModalActions/PublishModalActions'
import { showToast } from '@src/components/ui/toaster/Toaster'
import { track } from '@src/utils/analytics'
import { cx } from '@src/utils/cx'

import styles from './EditBookModal.module.scss'

type EditBookModalProps = {
  bookId: string | null
  isOpen: boolean
  onClose: () => void
}

type FormState = {
  title: string
  author: string
  publisher: string
  year: string
  notes: string
  condition: PublicationCondition
  status: PublicationStatus
  availability: PublicationAvailability
  priceAmount: string
  priceCurrency: string
  delivery: {
    nearBookCorner: boolean
    inPerson: boolean
    shipping: boolean
    shippingPayer: 'owner' | 'requester' | 'split'
  }
  images: PublicationImage[]
}

const STATUS_FLOW: PublicationStatus[] = ['available', 'reserved', 'completed']
const CONDITION_OPTIONS: PublicationCondition[] = [
  'new',
  'very_good',
  'good',
  'acceptable',
  'unknown',
]

let imageIdCounter = 0
const createImageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  imageIdCounter += 1
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 9)
  return `img-${timestamp}-${random}-${imageIdCounter}`
}

const publicationToFormState = (publication: Publication): FormState => ({
  title: publication.metadata.title,
  author: publication.metadata.author,
  publisher: publication.metadata.publisher ?? '',
  year: publication.metadata.year ?? '',
  notes: publication.notes,
  condition: publication.condition,
  status: publication.status,
  availability: publication.availability,
  priceAmount:
    publication.price.amount === null ? '' : String(publication.price.amount),
  priceCurrency: publication.price.currency,
  delivery: {
    nearBookCorner: publication.delivery.nearBookCorner,
    inPerson: publication.delivery.inPerson,
    shipping: publication.delivery.shipping,
    shippingPayer: publication.delivery.shippingPayer,
  },
  images: publication.images,
})

const normalizeAmount = (amount: string): number | null => {
  const trimmed = amount.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, '.'))
  return Number.isFinite(parsed) ? parsed : NaN
}

const buildUpdatePayload = (
  original: Publication,
  form: FormState
): PublicationUpdate => {
  const update: PublicationUpdate = {}
  const metadataDiff: PublicationUpdate['metadata'] = {}

  if (form.title !== original.metadata.title) {
    metadataDiff.title = form.title
  }

  if (form.author !== original.metadata.author) {
    metadataDiff.author = form.author
  }

  if ((original.metadata.publisher ?? '') !== form.publisher) {
    metadataDiff.publisher = form.publisher
  }

  if ((original.metadata.year ?? '') !== form.year) {
    metadataDiff.year = form.year
  }

  if (Object.keys(metadataDiff).length > 0) {
    update.metadata = metadataDiff
  }

  if (form.notes !== original.notes) {
    update.notes = form.notes
  }

  if (form.condition !== original.condition) {
    update.condition = form.condition
  }

  if (form.status !== original.status) {
    update.status = form.status
  }

  if (form.availability !== original.availability) {
    update.availability = form.availability
  }

  const amount = normalizeAmount(form.priceAmount)
  if (
    amount !== original.price.amount ||
    form.priceCurrency !== original.price.currency
  ) {
    update.price = {
      amount: Number.isNaN(amount) ? original.price.amount : amount,
      currency: form.priceCurrency,
    }
  }

  const deliveryChanged =
    form.delivery.nearBookCorner !== original.delivery.nearBookCorner ||
    form.delivery.inPerson !== original.delivery.inPerson ||
    form.delivery.shipping !== original.delivery.shipping ||
    form.delivery.shippingPayer !== original.delivery.shippingPayer

  if (deliveryChanged) {
    update.delivery = { ...form.delivery }
  }

  const originalImages = original.images
  let imagesChanged = form.images.length !== originalImages.length

  if (!imagesChanged) {
    imagesChanged = form.images.some((image, index) => {
      const originalImage = originalImages[index]
      if (!originalImage) return true
      return image.url !== originalImage.url || image.alt !== originalImage.alt
    })
  }

  if (imagesChanged) {
    update.images = form.images.map((image, index) => ({
      ...image,
      id: image.id || originalImages[index]?.id || createImageId(),
      alt: image.alt || originalImages[index]?.alt || original.metadata.title,
    }))
  }

  return update
}

const hasUpdates = (update: PublicationUpdate) =>
  Object.values(update).some((value) => value !== undefined)

const mapErrorToMessageKey = (error: PublicationApiError): string => {
  switch (error.type) {
    case 'not_found':
      return 'bookDetail.messages.notFound'
    case 'forbidden':
      return 'bookDetail.messages.forbidden'
    case 'validation':
      return 'bookDetail.messages.validation'
    case 'network':
      return 'bookDetail.messages.network'
    default:
      return 'bookDetail.messages.error'
  }
}

export const EditBookModal = ({
  bookId,
  isOpen,
  onClose,
}: EditBookModalProps) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [original, setOriginal] = useState<Publication | null>(null)
  const [showStatusConfirm, setShowStatusConfirm] =
    useState<PublicationStatus | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const { data, status, error } = useBookDetails(isOpen ? bookId : null)
  const updateMutation = useUpdateBook(isOpen ? bookId : null)

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen,
    onEscape: () => handleClose(),
  })

  useEffect(() => {
    if (!isOpen) {
      setFormState(null)
      setOriginal(null)
      setLocalError(null)
      return
    }

    if (data) {
      setOriginal(data)
      setFormState(publicationToFormState(data))
      setLocalError(null)
      track('view_book_detail', {
        bookId: data.id,
        status: data.status,
        isOwner: data.isOwner,
      })
      if (data.isOwner) {
        track('open_edit_book', { bookId: data.id })
      }
    }
  }, [data, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!formState || !original) return
      const update = buildUpdatePayload(original, formState)
      if (!hasUpdates(update)) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [formState, isOpen, original])

  const updatePayload = useMemo(() => {
    if (!formState || !original) return undefined
    return buildUpdatePayload(original, formState)
  }, [formState, original])

  const isDirty = Boolean(updatePayload && hasUpdates(updatePayload))
  const isOwner = data?.isOwner ?? false

  const handleClose = () => {
    if (isDirty && isOwner) {
      const shouldClose = window.confirm(t('bookDetail.confirm.close'))
      if (!shouldClose) return
    }
    onClose()
  }

  const handleSave = async () => {
    if (!isOwner || !formState || !original || !updatePayload) return
    if (!hasUpdates(updatePayload)) {
      showToast(t('bookDetail.messages.noChanges'), 'info')
      return
    }

    const amount = normalizeAmount(formState.priceAmount)
    if (Number.isNaN(amount)) {
      setLocalError(t('bookDetail.validation.price'))
      return
    }

    setLocalError(null)

    try {
      const result = await updateMutation.mutateAsync(updatePayload)
      setOriginal(result)
      setFormState(publicationToFormState(result))
      showToast(t('bookDetail.messages.saved'), 'success')
      track('save_edit_book_success', { bookId: result.id })
    } catch (mutationError) {
      const messageKey = isPublicationApiError(mutationError)
        ? mapErrorToMessageKey(mutationError)
        : 'bookDetail.messages.error'
      showToast(t(messageKey), 'error')
      track('save_edit_book_error', {
        bookId: original.id,
        error: isPublicationApiError(mutationError)
          ? mutationError.type
          : 'unknown',
      })
    }
  }

  const handleFieldChange = (changes: Partial<FormState>) => {
    setFormState((prev) => (prev ? { ...prev, ...changes } : prev))
  }

  const handleDeliveryChange = (
    field: keyof FormState['delivery'],
    value: FormState['delivery'][typeof field]
  ) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              [field]: value,
            },
          }
        : prev
    )
  }

  const handleImageUrlChange = (index: number, value: string) => {
    setFormState((prev) => {
      if (!prev) return prev
      const images = [...prev.images]
      const existingImage = images[index]
      const baseImage: PublicationImage = existingImage
        ? existingImage
        : {
            id: createImageId(),
            url: '',
            alt: prev.title,
          }
      images[index] = {
        ...baseImage,
        url: value,
        alt: baseImage.alt || prev.title,
      }
      return { ...prev, images }
    })
  }

  const handleRemoveImage = (index: number) => {
    setFormState((prev) => {
      if (!prev) return prev
      const images = prev.images.filter((_, idx) => idx !== index)
      return { ...prev, images }
    })
  }

  const handleAddImage = () => {
    setFormState((prev) => {
      if (!prev) return prev
      const image: PublicationImage = {
        id: createImageId(),
        url: '',
        alt: prev.title,
      }
      return { ...prev, images: [...prev.images, image] }
    })
  }

  const handleCycleStatus = () => {
    if (!formState) return
    const currentIndex = STATUS_FLOW.indexOf(formState.status)
    const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length]
    if (formState.status === 'completed' && nextStatus === 'available') {
      setShowStatusConfirm(nextStatus)
      return
    }
    handleFieldChange({ status: nextStatus })
  }

  const confirmStatusChange = (statusToApply: PublicationStatus) => {
    setFormState((prev) => (prev ? { ...prev, status: statusToApply } : prev))
    setShowStatusConfirm(null)
  }

  const cancelStatusChange = () => setShowStatusConfirm(null)

  const renderStatusBadge = () => {
    if (!formState) return null
    return (
      <span className={cx(styles.statusBadge, styles[formState.status])}>
        {t(`bookDetail.status.${formState.status}`)}
      </span>
    )
  }

  const renderImages = () => {
    if (!formState) return null
    const images = formState.images
    const secondaryImages = images.slice(1)
    const hasImages = images.length > 0
    const hasSecondaryImages = secondaryImages.length > 0

    return (
      <div className={styles.imagesSection}>
        <header className={styles.sectionHeader}>
          <h3>{t('bookDetail.sections.images')}</h3>
          {isOwner ? (
            <button
              type="button"
              onClick={handleAddImage}
              className={styles.addImageButton}
              disabled={!isOwner}
            >
              {t('bookDetail.actions.addImage')}
            </button>
          ) : null}
        </header>
        {!hasImages ? (
          <p className={styles.empty}>{t('bookDetail.emptyImages')}</p>
        ) : !hasSecondaryImages ? (
          <p className={styles.empty}>{t('bookDetail.images.onlyPrimary')}</p>
        ) : (
          <ul className={styles.imageGrid}>
            {secondaryImages.map((image, index) => {
              const displayIndex = index + 1
              const hasUrl = Boolean(image.url)
              return (
                <li key={image.id} className={styles.imageCard}>
                  {hasUrl ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className={styles.imagePreview}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>
                        {t(
                          isOwner
                            ? 'bookDetail.images.placeholderOwner'
                            : 'bookDetail.images.placeholder'
                        )}
                      </span>
                    </div>
                  )}
                  {isOwner ? (
                    <div className={styles.imageControls}>
                      <label
                        className={styles.fieldLabel}
                        htmlFor={`image-${image.id}`}
                      >
                        {t('bookDetail.fields.imageUrl')}
                      </label>
                      <input
                        id={`image-${image.id}`}
                        type="url"
                        value={image.url}
                        onChange={(event) =>
                          handleImageUrlChange(displayIndex, event.target.value)
                        }
                        disabled={!isOwner}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(displayIndex)}
                        className={styles.removeImageButton}
                      >
                        {t('bookDetail.actions.removeImage')}
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  const footer = (
    <PublishModalActions
      leftActions={[
        {
          label: t('bookDetail.actions.cancel'),
          onClick: handleClose,
          variant: 'ghost',
        },
      ]}
      rightActions={
        isOwner
          ? [
              {
                label: t('bookDetail.actions.changeStatus'),
                onClick: handleCycleStatus,
                disabled: !formState,
                variant: 'secondary',
              },
              {
                label: updateMutation.isPending
                  ? t('bookDetail.actions.saving')
                  : t('bookDetail.actions.save'),
                onClick: handleSave,
                disabled: !isDirty || updateMutation.isPending || !formState,
                variant: 'primary',
              },
            ]
          : [
              {
                label: t('bookDetail.actions.close'),
                onClick: handleClose,
                variant: 'secondary',
              },
            ]
      }
    />
  )

  const renderContent = () => {
    if (status === 'pending' || (isOpen && !formState && !error)) {
      return (
        <div className={styles.loading}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      )
    }

    if (error) {
      const messageKey = isPublicationApiError(error)
        ? mapErrorToMessageKey(error)
        : 'bookDetail.messages.error'
      return (
        <div className={styles.errorState}>
          <p>{t(messageKey)}</p>
          <button type="button" onClick={handleClose}>
            {t('bookDetail.actions.close')}
          </button>
        </div>
      )
    }

    if (!formState || !original) {
      return (
        <div className={styles.errorState}>
          <p>{t('bookDetail.empty')}</p>
          <button type="button" onClick={handleClose}>
            {t('bookDetail.actions.close')}
          </button>
        </div>
      )
    }

    const primaryImage = formState.images[0]
    const hasPrimaryImage = Boolean(primaryImage?.url)

    return (
      <div className={styles.content}>
        <div className={styles.heroRow}>
          <div className={styles.heroMedia}>
            <div className={styles.heroImageFrame}>
              {hasPrimaryImage ? (
                <img
                  src={primaryImage?.url}
                  alt={primaryImage?.alt ?? formState.title}
                  className={styles.heroImage}
                />
              ) : (
                <div className={styles.heroPlaceholder}>
                  <span>
                    {t(
                      isOwner
                        ? 'bookDetail.images.placeholderOwner'
                        : 'bookDetail.images.placeholder'
                    )}
                  </span>
                </div>
              )}
            </div>
            {isOwner ? (
              <div className={styles.primaryImageControls}>
                <label
                  className={styles.fieldLabel}
                  htmlFor="book-primary-image"
                >
                  {t('bookDetail.fields.primaryImageUrl')}
                </label>
                <input
                  id="book-primary-image"
                  type="url"
                  value={primaryImage?.url ?? ''}
                  onChange={(event) =>
                    handleImageUrlChange(0, event.target.value)
                  }
                  disabled={!isOwner}
                />
                {formState.images.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className={styles.removeImageButton}
                  >
                    {t('bookDetail.actions.removeImage')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className={styles.meta}>
            <div className={styles.metaHeader}>
              <h2>{formState.title}</h2>
              {renderStatusBadge()}
            </div>
            <p className={styles.metaAuthor}>{formState.author}</p>
            <dl className={styles.metaList}>
              {formState.publisher ? (
                <div>
                  <dt>{t('bookDetail.fields.publisher')}</dt>
                  <dd>{formState.publisher}</dd>
                </div>
              ) : null}
              {formState.year ? (
                <div>
                  <dt>{t('bookDetail.fields.year')}</dt>
                  <dd>{formState.year}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t('bookDetail.fields.updated')}</dt>
                <dd>{new Date(original.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className={styles.section}>
          <h3>{t('bookDetail.sections.details')}</h3>
          <div className={styles.formGrid}>
            <label className={styles.fieldLabel} htmlFor="book-title">
              {t('bookDetail.fields.title')}
            </label>
            <input
              id="book-title"
              type="text"
              value={formState.title}
              onChange={(event) =>
                handleFieldChange({ title: event.target.value })
              }
              disabled={!isOwner}
            />

            <label className={styles.fieldLabel} htmlFor="book-notes">
              {t('bookDetail.fields.notes')}
            </label>
            <textarea
              id="book-notes"
              value={formState.notes}
              onChange={(event) =>
                handleFieldChange({ notes: event.target.value })
              }
              disabled={!isOwner}
            />

            <label className={styles.fieldLabel} htmlFor="book-condition">
              {t('bookDetail.fields.condition')}
            </label>
            <select
              id="book-condition"
              value={formState.condition}
              onChange={(event) =>
                handleFieldChange({
                  condition: event.target.value as PublicationCondition,
                })
              }
              disabled={!isOwner}
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`publishBook.offer.condition.options.${option}`)}
                </option>
              ))}
            </select>

            <label className={styles.fieldLabel} htmlFor="book-status">
              {t('bookDetail.fields.status')}
            </label>
            <select
              id="book-status"
              value={formState.status}
              onChange={(event) => {
                const nextStatus = event.target.value as PublicationStatus
                if (
                  formState.status === 'completed' &&
                  nextStatus === 'available'
                ) {
                  setShowStatusConfirm(nextStatus)
                  return
                }
                handleFieldChange({ status: nextStatus })
              }}
              disabled={!isOwner}
            >
              {STATUS_FLOW.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {t(`bookDetail.status.${statusOption}`)}
                </option>
              ))}
            </select>

            <fieldset className={styles.availabilityGroup}>
              <legend>{t('bookDetail.fields.availability')}</legend>
              <label>
                <input
                  type="radio"
                  name="availability"
                  value="public"
                  checked={formState.availability === 'public'}
                  onChange={() => handleFieldChange({ availability: 'public' })}
                  disabled={!isOwner}
                />
                {t('bookDetail.availability.public')}
              </label>
              <label>
                <input
                  type="radio"
                  name="availability"
                  value="private"
                  checked={formState.availability === 'private'}
                  onChange={() =>
                    handleFieldChange({ availability: 'private' })
                  }
                  disabled={!isOwner}
                />
                {t('bookDetail.availability.private')}
              </label>
            </fieldset>

            <div className={styles.priceRow}>
              <label className={styles.fieldLabel} htmlFor="book-price">
                {t('bookDetail.fields.price')}
              </label>
              <div className={styles.priceInputs}>
                <input
                  id="book-price"
                  type="number"
                  inputMode="decimal"
                  value={formState.priceAmount}
                  onChange={(event) =>
                    handleFieldChange({ priceAmount: event.target.value })
                  }
                  disabled={!isOwner}
                />
                <input
                  id="book-currency"
                  type="text"
                  value={formState.priceCurrency}
                  onChange={(event) =>
                    handleFieldChange({ priceCurrency: event.target.value })
                  }
                  disabled={!isOwner}
                  className={styles.currencyInput}
                />
              </div>
              {localError ? (
                <p className={styles.inlineError}>{localError}</p>
              ) : null}
            </div>

            <fieldset className={styles.deliveryGroup}>
              <legend>{t('bookDetail.fields.delivery')}</legend>
              <label>
                <input
                  type="checkbox"
                  checked={formState.delivery.inPerson}
                  onChange={(event) =>
                    handleDeliveryChange('inPerson', event.target.checked)
                  }
                  disabled={!isOwner}
                />
                {t('bookDetail.delivery.inPerson')}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formState.delivery.nearBookCorner}
                  onChange={(event) =>
                    handleDeliveryChange('nearBookCorner', event.target.checked)
                  }
                  disabled={!isOwner}
                />
                {t('bookDetail.delivery.corner')}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formState.delivery.shipping}
                  onChange={(event) =>
                    handleDeliveryChange('shipping', event.target.checked)
                  }
                  disabled={!isOwner}
                />
                {t('bookDetail.delivery.shipping')}
              </label>
              <label className={styles.shippingPayer}>
                <span>{t('bookDetail.delivery.shippingPayer')}</span>
                <select
                  value={formState.delivery.shippingPayer}
                  onChange={(event) =>
                    handleDeliveryChange(
                      'shippingPayer',
                      event.target
                        .value as FormState['delivery']['shippingPayer']
                    )
                  }
                  disabled={!isOwner || !formState.delivery.shipping}
                >
                  <option value="owner">
                    {t('bookDetail.delivery.payer.owner')}
                  </option>
                  <option value="requester">
                    {t('bookDetail.delivery.payer.requester')}
                  </option>
                  <option value="split">
                    {t('bookDetail.delivery.payer.split')}
                  </option>
                </select>
              </label>
            </fieldset>
          </div>
        </section>

        {renderImages()}
      </div>
    )
  }

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('bookDetail.title')}
      subtitle={t(
        isOwner ? 'bookDetail.subtitleOwner' : 'bookDetail.subtitleGuest'
      )}
      onClose={handleClose}
      closeLabel={t('bookDetail.actions.close')}
      footer={footer}
      roleDescription={t('bookDetail.roleDescription')}
    >
      {renderContent()}

      {showStatusConfirm ? (
        <div className={styles.confirmOverlay}>
          <div
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
          >
            <p>{t('bookDetail.confirm.reopen')}</p>
            <div className={styles.confirmActions}>
              <button type="button" onClick={cancelStatusChange}>
                {t('bookDetail.confirm.cancel')}
              </button>
              <button
                type="button"
                onClick={() => confirmStatusChange(showStatusConfirm)}
              >
                {t('bookDetail.confirm.accept')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PublishModal>
  )
}
