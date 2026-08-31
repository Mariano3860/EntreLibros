import { genres } from '@components/publish/PublishBookModal/PublishBookModal.constants'
import { PublishModal } from '@components/publish/shared/PublishModal/PublishModal'
import { useBookDetails } from '@hooks/api/useBookDetails'
import { useUpdateBook } from '@hooks/api/useUpdateBook'
import { useFocusTrap } from '@hooks/useFocusTrap'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import type {
  PublicationStatus,
  PublicationUpdate,
} from '@src/api/books/publication.types'
import { MAX_IMAGES_UPLOAD } from '@src/constants/constants'
import { useAuth } from '@src/contexts/auth/AuthContext'

import styles from './BookDetailModal.module.scss'
import { BookDetailModalProps } from './BookDetailModal.types'

type PublicationOfferUpdate = NonNullable<PublicationUpdate['offer']>
type PublicationDeliveryUpdate = NonNullable<PublicationOfferUpdate['delivery']>

const publicationStatuses: PublicationStatus[] = [
  'available',
  'reserved',
  'completed',
  'draft',
  'sold',
  'exchanged',
]

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  bookId,
  onClose,
  bookPreview,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)
  const retryTimeoutRef = useRef<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editedData, setEditedData] = useState<PublicationUpdate>({})
  const [isRetrying, setIsRetrying] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const {
    data: book,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBookDetails(bookId)
  const updateMutation = useUpdateBook(bookId || '')

  const currentUserId = user?.id
  const normalizedCurrentUserId =
    currentUserId !== undefined && currentUserId !== null
      ? String(currentUserId)
      : null
  const isOwner = Boolean(
    book && normalizedCurrentUserId && book.ownerId === normalizedCurrentUserId
  )

  const isLoadingState = isLoading || isRetrying || (isFetching && !book)

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm(t('bookDetail.confirmClose'))) {
        onClose()
      }
    } else {
      onClose()
    }
  }, [hasChanges, t, onClose])

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen,
    onEscape: handleClose,
  })

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
      setHasChanges(false)
      setEditedData({})
      setIsRetrying(false)
      setActiveImageIndex(0)
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [bookId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, hasChanges, handleClose])

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm(t('bookDetail.confirmClose'))) {
        setIsEditing(false)
        setHasChanges(false)
        setEditedData({})
      }
    } else {
      setIsEditing(false)
      setEditedData({})
    }
  }

  const handleRetry = useCallback(() => {
    setIsRetrying(true)
    refetch()
      .catch(() => {
        /* noop */
      })
      .finally(() => {
        if (!isMountedRef.current) return
        setIsRetrying(false)
        retryTimeoutRef.current = null
      })
  }, [refetch])

  const handleSave = async () => {
    if (!bookId || !hasChanges) return

    try {
      await updateMutation.mutateAsync(editedData)
      toast.success(t('bookDetail.saved'))
      setIsEditing(false)
      setHasChanges(false)
      setEditedData({})
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && err.message.includes('403')
          ? t('bookDetail.errors.forbidden')
          : err instanceof Error && err.message.includes('400')
            ? t('bookDetail.errors.validation')
            : t('bookDetail.errors.unknown')
      toast.error(`${t('bookDetail.saveError')}: ${errorMessage}`)
    }
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleOfferChange = (update: Partial<PublicationOfferUpdate>) => {
    setEditedData((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        ...update,
      },
    }))
    setHasChanges(true)
  }

  const handleDeliveryChange = (update: Partial<PublicationDeliveryUpdate>) => {
    setEditedData((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        delivery: {
          ...prev.offer?.delivery,
          ...update,
        },
      },
    }))
    setHasChanges(true)
  }

  const handleTradePreferenceToggle = (genre: string) => {
    const preferences =
      editedData.offer?.tradePreferences ?? book?.offer.tradePreferences ?? []
    const nextPreferences = preferences.includes(genre)
      ? preferences.filter((item) => item !== genre)
      : [...preferences, genre]

    handleOfferChange({ tradePreferences: nextPreferences })
  }

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || !book) return

    const currentImages = editedData.images ?? book.images
    const remainingSlots = Math.max(0, MAX_IMAGES_UPLOAD - currentImages.length)
    const filesToRead = Array.from(files).slice(0, remainingSlots)
    const uploads = await Promise.all(
      filesToRead.map(
        (file, index) =>
          new Promise<NonNullable<PublicationUpdate['images']>[number]>(
            (resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () =>
                resolve({
                  id: `${file.name}-${Date.now()}-${index}`,
                  url: String(reader.result),
                  source: 'upload',
                })
              reader.onerror = () =>
                reject(reader.error ?? new Error('Failed to read image'))
              reader.readAsDataURL(file)
            }
          )
      )
    )

    if (uploads.length > 0) {
      handleFieldChange('images', [...currentImages, ...uploads])
    }
  }

  const handleImageRemove = (imageId: string) => {
    if (!book) return

    const currentImages = editedData.images ?? book.images
    handleFieldChange(
      'images',
      currentImages.filter((image) => image.id !== imageId)
    )
    setActiveImageIndex((index) => Math.max(0, index - 1))
  }

  if (!isOpen) return null

  const renderContent = () => {
    if (isError && !isRetrying) {
      const errorMessage =
        error instanceof Error && error.message.includes('404')
          ? t('bookDetail.notFound')
          : t('bookDetail.error')

      return (
        <div className={styles.error}>
          <p>{errorMessage}</p>
          <button
            onClick={handleRetry}
            className={styles.retryButton}
            aria-label={t('bookDetail.retry')}
            disabled={isRetrying}
          >
            {t('bookDetail.retry')}
          </button>
        </div>
      )
    }

    if (isLoadingState) {
      return (
        <div className={styles.loading}>
          <p>{t('bookDetail.loading')}</p>
        </div>
      )
    }

    if (!book) {
      return null
    }

    const displayBook = bookPreview
      ? {
          ...book,
          title: bookPreview.title,
          author: bookPreview.author,
          coverUrl: bookPreview.coverUrl || book.coverUrl,
          isSeeking: bookPreview.isSeeking ?? book.isSeeking,
          images: book.images.map((image, index) =>
            index === 0 && bookPreview.coverUrl
              ? { ...image, url: bookPreview.coverUrl }
              : image
          ),
        }
      : book

    const galleryImages = editedData.images?.length
      ? editedData.images
      : editedData.images
        ? []
        : displayBook.images?.length
          ? displayBook.images
          : displayBook.coverUrl
            ? [
                {
                  id: `cover-${displayBook.id}`,
                  url: displayBook.coverUrl,
                  source: 'cover' as const,
                },
              ]
            : []
    const currentImageIndex = Math.min(
      activeImageIndex,
      Math.max(galleryImages.length - 1, 0)
    )
    const currentImage = galleryImages[currentImageIndex]

    const currentTitle =
      isEditing && editedData.title !== undefined
        ? editedData.title
        : displayBook.title
    const currentAuthor =
      isEditing && editedData.author !== undefined
        ? editedData.author
        : displayBook.author
    const currentPublisher =
      isEditing && editedData.publisher !== undefined
        ? editedData.publisher || ''
        : displayBook.publisher || ''
    const currentYear =
      isEditing && editedData.year !== undefined
        ? editedData.year?.toString() || ''
        : displayBook.year?.toString() || ''
    const currentLanguage =
      isEditing && editedData.language !== undefined
        ? editedData.language || ''
        : displayBook.language || ''
    const currentFormat =
      isEditing && editedData.format !== undefined
        ? editedData.format || ''
        : displayBook.format || ''
    const currentIsbn =
      isEditing && editedData.isbn !== undefined
        ? editedData.isbn || ''
        : displayBook.isbn || ''
    const currentCondition =
      isEditing && editedData.condition !== undefined
        ? editedData.condition
        : book.condition
    const currentNotes =
      isEditing && editedData.notes !== undefined
        ? editedData.notes || ''
        : book.notes || ''
    const currentStatus =
      isEditing && editedData.status !== undefined
        ? editedData.status
        : book.status
    const isSeeking = displayBook.isSeeking ?? displayBook.type === 'want'
    const statusClass = isSeeking
      ? styles.seeking
      : currentStatus
        ? styles[currentStatus]
        : ''
    const statusLabel = isSeeking
      ? t('bookDetail.status.seeking')
      : currentStatus
        ? t(`bookDetail.status.${currentStatus}`)
        : ''
    const currentOffer = {
      ...displayBook.offer,
      ...editedData.offer,
      price:
        editedData.offer?.price !== undefined
          ? editedData.offer.price
          : displayBook.offer.price,
      delivery: {
        ...displayBook.offer.delivery,
        ...editedData.offer?.delivery,
      },
      tradePreferences:
        editedData.offer?.tradePreferences ??
        displayBook.offer.tradePreferences,
    }
    const currentPriceAmount = currentOffer.price?.amount?.toString() ?? ''
    const currentPriceCurrency = currentOffer.price?.currency ?? 'ARS'

    return (
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.sectionHeading}>
            <span>{t('bookDetail.fields.images')}</span>
            {isEditing && isOwner && (
              <span className={styles.imageCount}>
                {t('bookDetail.gallery.count', {
                  count: galleryImages.length,
                  max: MAX_IMAGES_UPLOAD,
                })}
              </span>
            )}
          </div>
          <div className={styles.galleryFrame}>
            {currentImage ? (
              <img
                src={currentImage.url}
                alt={t('bookDetail.gallery.imageAlt', {
                  current: currentImageIndex + 1,
                  total: galleryImages.length,
                  title: displayBook.title,
                })}
                className={styles.coverImage}
              />
            ) : (
              <div className={styles.noCover}>
                <span>{t('bookDetail.fields.images')}</span>
              </div>
            )}
            {galleryImages.length > 1 && (
              <div className={styles.galleryControls}>
                <button
                  type="button"
                  aria-label={t('bookDetail.gallery.previous')}
                  onClick={() =>
                    setActiveImageIndex(
                      (currentImageIndex - 1 + galleryImages.length) %
                        galleryImages.length
                    )
                  }
                >
                  &lsaquo;
                </button>
                <span aria-live="polite">
                  {t('bookDetail.gallery.counter', {
                    current: currentImageIndex + 1,
                    total: galleryImages.length,
                  })}
                </span>
                <button
                  type="button"
                  aria-label={t('bookDetail.gallery.next')}
                  onClick={() =>
                    setActiveImageIndex(
                      (currentImageIndex + 1) % galleryImages.length
                    )
                  }
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div
              className={styles.thumbnails}
              aria-label={t('bookDetail.gallery.label')}
            >
              {galleryImages.map((image, index) => (
                <div key={image.id} className={styles.thumbnailItem}>
                  <button
                    type="button"
                    className={`${styles.thumbnailButton} ${
                      index === currentImageIndex ? styles.thumbnailActive : ''
                    }`.trim()}
                    aria-label={t('bookDetail.gallery.select', {
                      number: index + 1,
                    })}
                    aria-current={
                      index === currentImageIndex ? 'true' : undefined
                    }
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image.url} alt="" className={styles.thumbnail} />
                  </button>
                  {isEditing && isOwner && (
                    <button
                      type="button"
                      className={styles.removeImage}
                      aria-label={t('bookDetail.gallery.remove', {
                        number: index + 1,
                      })}
                      onClick={() => handleImageRemove(image.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {isEditing && isOwner && (
            <div className={styles.imageEditor}>
              <label className={styles.uploadButton}>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={galleryImages.length >= MAX_IMAGES_UPLOAD}
                  onChange={(event) => {
                    void handleImageFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
                {t('bookDetail.gallery.add')}
              </label>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.statusBadge}>
            <span className={`${styles.status} ${statusClass}`.trim()}>
              {statusLabel}
            </span>
            {isOwner && (
              <span className={styles.ownerBadge}>{t('bookDetail.owner')}</span>
            )}
          </div>

          <div className={styles.metadataGrid}>
            <div className={styles.field}>
              <label htmlFor="book-detail-title">
                {t('bookDetail.fields.title')}
              </label>
              {isEditing && isOwner ? (
                <input
                  id="book-detail-title"
                  type="text"
                  value={currentTitle}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{currentTitle}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="book-detail-author">
                {t('bookDetail.fields.author')}
              </label>
              {isEditing && isOwner ? (
                <input
                  id="book-detail-author"
                  type="text"
                  value={currentAuthor}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{currentAuthor}</p>
              )}
            </div>

            {isEditing && isOwner ? (
              <>
                <div className={styles.field}>
                  <label htmlFor="book-detail-publisher">
                    {t('bookDetail.fields.publisher')}
                  </label>
                  <input
                    id="book-detail-publisher"
                    type="text"
                    value={currentPublisher}
                    onChange={(e) =>
                      handleFieldChange('publisher', e.target.value || null)
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="book-detail-year">
                    {t('bookDetail.fields.year')}
                  </label>
                  <input
                    id="book-detail-year"
                    type="number"
                    value={currentYear}
                    onChange={(e) =>
                      handleFieldChange(
                        'year',
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="book-detail-language">
                    {t('bookDetail.fields.language')}
                  </label>
                  <input
                    id="book-detail-language"
                    type="text"
                    value={currentLanguage}
                    onChange={(e) =>
                      handleFieldChange('language', e.target.value || null)
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="book-detail-format">
                    {t('bookDetail.fields.format')}
                  </label>
                  <input
                    id="book-detail-format"
                    type="text"
                    value={currentFormat}
                    onChange={(e) =>
                      handleFieldChange('format', e.target.value || null)
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="book-detail-isbn">
                    {t('bookDetail.fields.isbn')}
                  </label>
                  <input
                    id="book-detail-isbn"
                    type="text"
                    value={currentIsbn}
                    onChange={(e) =>
                      handleFieldChange('isbn', e.target.value || null)
                    }
                    className={styles.input}
                  />
                </div>
              </>
            ) : (
              <>
                {displayBook.publisher && (
                  <div className={styles.field}>
                    <label>{t('bookDetail.fields.publisher')}</label>
                    <p className={styles.value}>{displayBook.publisher}</p>
                  </div>
                )}
                {displayBook.year && (
                  <div className={styles.field}>
                    <label>{t('bookDetail.fields.year')}</label>
                    <p className={styles.value}>{displayBook.year}</p>
                  </div>
                )}
                {displayBook.language && (
                  <div className={styles.field}>
                    <label>{t('bookDetail.fields.language')}</label>
                    <p className={styles.value}>{displayBook.language}</p>
                  </div>
                )}
                {displayBook.format && (
                  <div className={styles.field}>
                    <label>{t('bookDetail.fields.format')}</label>
                    <p className={styles.value}>{displayBook.format}</p>
                  </div>
                )}
                {displayBook.isbn && (
                  <div className={styles.field}>
                    <label>{t('bookDetail.fields.isbn')}</label>
                    <p className={styles.value}>{displayBook.isbn}</p>
                  </div>
                )}
              </>
            )}

            <div className={styles.field}>
              <label htmlFor="book-detail-condition">
                {t('bookDetail.fields.condition')}
              </label>
              {isEditing && isOwner ? (
                <select
                  id="book-detail-condition"
                  value={currentCondition}
                  onChange={(e) =>
                    handleFieldChange(
                      'condition',
                      e.target.value as
                        | 'new'
                        | 'very_good'
                        | 'good'
                        | 'acceptable'
                    )
                  }
                  className={styles.select}
                >
                  <option value="new">
                    {t('publishBook.offer.condition.options.new')}
                  </option>
                  <option value="very_good">
                    {t('publishBook.offer.condition.options.very_good')}
                  </option>
                  <option value="good">
                    {t('publishBook.offer.condition.options.good')}
                  </option>
                  <option value="acceptable">
                    {t('publishBook.offer.condition.options.acceptable')}
                  </option>
                </select>
              ) : (
                <p className={styles.value}>
                  {t(`publishBook.preview.condition.${currentCondition}`)}
                </p>
              )}
            </div>

            {isEditing && isOwner && (
              <div className={styles.field}>
                <label htmlFor="book-detail-status">
                  {t('bookDetail.fields.status')}
                </label>
                <select
                  id="book-detail-status"
                  value={currentStatus}
                  onChange={(e) =>
                    handleFieldChange(
                      'status',
                      e.target.value as PublicationStatus
                    )
                  }
                  className={styles.select}
                >
                  {publicationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`bookDetail.status.${status}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label htmlFor="book-detail-notes">
              {t('bookDetail.fields.notes')}
            </label>
            {isEditing && isOwner ? (
              <textarea
                id="book-detail-notes"
                value={currentNotes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            ) : currentNotes ? (
              <p className={styles.value}>{currentNotes}</p>
            ) : (
              <p className={styles.empty}>-</p>
            )}
          </div>

          <div className={styles.offerSection}>
            <h3>{t('bookDetail.offer.title')}</h3>
            {isEditing && isOwner ? (
              <>
                <div className={styles.formGroup}>
                  <label>{t('publishBook.offer.modes.label')}</label>
                  <div className={styles.checkboxGrid}>
                    {(['trade', 'sale', 'donation'] as const).map((mode) => (
                      <label key={mode} className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={currentOffer[mode]}
                          onChange={(event) =>
                            handleOfferChange({
                              [mode]: event.target.checked,
                            })
                          }
                        />
                        <span>{t(`publishBook.offer.modes.${mode}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {currentOffer.sale && (
                  <div className={styles.priceEditGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="book-detail-price">
                        {t('publishBook.offer.price.label')}
                      </label>
                      <input
                        id="book-detail-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPriceAmount}
                        onChange={(event) =>
                          handleOfferChange({
                            price: event.target.value
                              ? {
                                  amount: Number(event.target.value),
                                  currency: currentPriceCurrency,
                                }
                              : null,
                          })
                        }
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="book-detail-currency">
                        {t('publishBook.offer.price.currency')}
                      </label>
                      <select
                        id="book-detail-currency"
                        value={currentPriceCurrency}
                        onChange={(event) =>
                          handleOfferChange({
                            price: currentOffer.price
                              ? {
                                  amount: currentOffer.price.amount,
                                  currency: event.target.value,
                                }
                              : null,
                          })
                        }
                        className={styles.select}
                      >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentOffer.trade && (
                  <div className={styles.formGroup}>
                    <label>{t('publishBook.offer.trade.label')}</label>
                    <div className={styles.tagList}>
                      {genres.map((genre) => {
                        const isActive =
                          currentOffer.tradePreferences.includes(genre)
                        return (
                          <button
                            key={genre}
                            type="button"
                            className={`${styles.tag} ${
                              isActive ? styles.tagActive : ''
                            }`.trim()}
                            onClick={() => handleTradePreferenceToggle(genre)}
                          >
                            {t(`publishBook.offer.trade.genres.${genre}`)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="book-detail-availability">
                    {t('publishBook.offer.availability.label')}
                  </label>
                  <select
                    id="book-detail-availability"
                    value={currentOffer.availability}
                    onChange={(event) =>
                      handleOfferChange({
                        availability: event.target.value as
                          | 'public'
                          | 'private',
                      })
                    }
                    className={styles.select}
                  >
                    <option value="public">
                      {t('publishBook.offer.availability.options.public')}
                    </option>
                    <option value="private">
                      {t('publishBook.offer.availability.options.private')}
                    </option>
                  </select>
                </div>

                <div className={styles.deliverySection}>
                  <h4>{t('bookDetail.offer.delivery.title')}</h4>
                  <div className={styles.checkboxGrid}>
                    {(['nearBookCorner', 'inPerson', 'shipping'] as const).map(
                      (method) => (
                        <label key={method} className={styles.checkboxRow}>
                          <input
                            type="checkbox"
                            checked={currentOffer.delivery[method]}
                            onChange={(event) =>
                              handleDeliveryChange({
                                [method]: event.target.checked,
                              })
                            }
                          />
                          <span>
                            {t(`publishBook.offer.delivery.options.${method}`)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                  {currentOffer.delivery.shipping && (
                    <div className={styles.formGroup}>
                      <label htmlFor="book-detail-shipping-payer">
                        {t('publishBook.offer.delivery.shippingPayer.label')}
                      </label>
                      <select
                        id="book-detail-shipping-payer"
                        value={currentOffer.delivery.shippingPayer ?? 'owner'}
                        onChange={(event) =>
                          handleDeliveryChange({
                            shippingPayer: event.target.value as
                              | 'owner'
                              | 'requester'
                              | 'split',
                          })
                        }
                        className={styles.select}
                      >
                        <option value="owner">
                          {t('publishBook.offer.delivery.shippingPayer.owner')}
                        </option>
                        <option value="requester">
                          {t(
                            'publishBook.offer.delivery.shippingPayer.requester'
                          )}
                        </option>
                        <option value="split">
                          {t('publishBook.offer.delivery.shippingPayer.split')}
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.offerOptions}>
                  {currentOffer.sale && (
                    <div className={styles.offerItem}>
                      <span className={styles.offerLabel}>
                        {t('bookDetail.offer.sale')}
                      </span>
                      {currentOffer.price && (
                        <span className={styles.offerValue}>
                          {currentOffer.price.currency} ${' '}
                          {currentOffer.price.amount}
                        </span>
                      )}
                    </div>
                  )}
                  {currentOffer.trade && (
                    <div className={styles.offerItem}>
                      <span className={styles.offerLabel}>
                        {t('bookDetail.offer.trade')}
                      </span>
                      {currentOffer.tradePreferences.length > 0 && (
                        <span className={styles.offerValue}>
                          {currentOffer.tradePreferences.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  {currentOffer.donation && (
                    <div className={styles.offerItem}>
                      <span className={styles.offerLabel}>
                        {t('bookDetail.offer.donation')}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.deliverySection}>
                  <h4>{t('bookDetail.offer.delivery.title')}</h4>
                  <div className={styles.deliveryOptions}>
                    {currentOffer.delivery.nearBookCorner && (
                      <span className={styles.deliveryBadge}>
                        {t('bookDetail.offer.delivery.nearBookCorner')}
                      </span>
                    )}
                    {currentOffer.delivery.inPerson && (
                      <span className={styles.deliveryBadge}>
                        {t('bookDetail.offer.delivery.inPerson')}
                      </span>
                    )}
                    {currentOffer.delivery.shipping && (
                      <span className={styles.deliveryBadge}>
                        {t('bookDetail.offer.delivery.shipping')}
                      </span>
                    )}
                  </div>
                  {currentOffer.delivery.shipping &&
                    currentOffer.delivery.shippingPayer && (
                      <p className={styles.deliveryPayer}>
                        {t('bookDetail.offer.delivery.shippingPayer')}:{' '}
                        {t(
                          `publishBook.offer.delivery.shippingPayer.${currentOffer.delivery.shippingPayer}`
                        )}
                      </p>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderFooter = () => {
    if (isLoadingState || isError || !book) return null

    if (isEditing && isOwner) {
      return (
        <div className={styles.actions}>
          <button
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={updateMutation.isPending}
          >
            {t('bookDetail.cancel')}
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending
              ? t('bookDetail.saving')
              : t('bookDetail.save')}
          </button>
        </div>
      )
    }

    if (isOwner && !isEditing) {
      return (
        <div className={styles.actions}>
          <button onClick={handleEdit} className={styles.editButton}>
            {t('bookDetail.edit')}
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('bookDetail.title')}
      subtitle={
        isOwner && !isEditing
          ? t('bookDetail.owner')
          : !isOwner
            ? t('bookDetail.readOnly')
            : undefined
      }
      onClose={handleClose}
      closeLabel={t('bookDetail.close')}
      footer={renderFooter()}
      className={styles.bookDetailModal}
      roleDescription={t('bookDetail.title')}
    >
      {renderContent()}
    </PublishModal>
  )
}
