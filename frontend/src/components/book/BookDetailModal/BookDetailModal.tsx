import { PublishModal } from '@components/publish/shared/PublishModal/PublishModal'
import { useBookDetails } from '@hooks/api/useBookDetails'
import { useUpdateBook } from '@hooks/api/useUpdateBook'
import { useFocusTrap } from '@hooks/useFocusTrap'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { PublicationUpdate } from '@src/api/books/publication.types'
import { useAuth } from '@src/contexts/auth/AuthContext'

import styles from './BookDetailModal.module.scss'
import { BookDetailModalProps } from './BookDetailModal.types'

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  bookId,
  onClose,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)
  const retryTimeoutRef = useRef<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editedData, setEditedData] = useState<PublicationUpdate>({})
  const [isRetrying, setIsRetrying] = useState(false)

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
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, hasChanges, handleClose])

  useEffect(() => {
    return () => {
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
        retryTimeoutRef.current = window.setTimeout(() => {
          setIsRetrying(false)
          retryTimeoutRef.current = null
        }, 0)
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

    const currentTitle =
      isEditing && editedData.title !== undefined
        ? editedData.title
        : book.title
    const currentAuthor =
      isEditing && editedData.author !== undefined
        ? editedData.author
        : book.author
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

    return (
      <div className={styles.content}>
        <div className={styles.imageSection}>
          {book.images && book.images.length > 0 ? (
            <img
              src={book.images[0].url}
              alt={t('booksPage.cover_alt', { title: book.title })}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.noCover}>
              <span>{t('bookDetail.fields.images')}</span>
            </div>
          )}
          {book.images && book.images.length > 1 && (
            <div className={styles.thumbnails}>
              {book.images.slice(1).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className={styles.thumbnail}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.statusBadge}>
            <span
              className={`${styles.status} ${currentStatus ? styles[currentStatus] : ''}`}
            >
              {currentStatus && t(`bookDetail.status.${currentStatus}`)}
            </span>
            {isOwner && (
              <span className={styles.ownerBadge}>{t('bookDetail.owner')}</span>
            )}
          </div>

          <div className={styles.field}>
            <label>{t('bookDetail.fields.title')}</label>
            {isEditing && isOwner ? (
              <input
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
            <label>{t('bookDetail.fields.author')}</label>
            {isEditing && isOwner ? (
              <input
                type="text"
                value={currentAuthor}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                className={styles.input}
              />
            ) : (
              <p className={styles.value}>{currentAuthor}</p>
            )}
          </div>

          {book.publisher && (
            <div className={styles.field}>
              <label>{t('bookDetail.fields.publisher')}</label>
              <p className={styles.value}>{book.publisher}</p>
            </div>
          )}

          {book.year && (
            <div className={styles.field}>
              <label>{t('bookDetail.fields.year')}</label>
              <p className={styles.value}>{book.year}</p>
            </div>
          )}

          {book.language && (
            <div className={styles.field}>
              <label>{t('bookDetail.fields.language')}</label>
              <p className={styles.value}>{book.language}</p>
            </div>
          )}

          {book.format && (
            <div className={styles.field}>
              <label>{t('bookDetail.fields.format')}</label>
              <p className={styles.value}>{book.format}</p>
            </div>
          )}

          {book.isbn && (
            <div className={styles.field}>
              <label>{t('bookDetail.fields.isbn')}</label>
              <p className={styles.value}>{book.isbn}</p>
            </div>
          )}

          <div className={styles.field}>
            <label>{t('bookDetail.fields.condition')}</label>
            {isEditing && isOwner ? (
              <select
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

          <div className={styles.field}>
            <label>{t('bookDetail.fields.notes')}</label>
            {isEditing && isOwner ? (
              <textarea
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
            <div className={styles.offerOptions}>
              {book.offer.sale && (
                <div className={styles.offerItem}>
                  <span className={styles.offerLabel}>
                    {t('bookDetail.offer.sale')}
                  </span>
                  {book.offer.price && (
                    <span className={styles.offerValue}>
                      {book.offer.price.currency} ${book.offer.price.amount}
                    </span>
                  )}
                </div>
              )}
              {book.offer.trade && (
                <div className={styles.offerItem}>
                  <span className={styles.offerLabel}>
                    {t('bookDetail.offer.trade')}
                  </span>
                  {book.offer.tradePreferences.length > 0 && (
                    <span className={styles.offerValue}>
                      {book.offer.tradePreferences.join(', ')}
                    </span>
                  )}
                </div>
              )}
              {book.offer.donation && (
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
                {book.offer.delivery.nearBookCorner && (
                  <span className={styles.deliveryBadge}>
                    {t('bookDetail.offer.delivery.nearBookCorner')}
                  </span>
                )}
                {book.offer.delivery.inPerson && (
                  <span className={styles.deliveryBadge}>
                    {t('bookDetail.offer.delivery.inPerson')}
                  </span>
                )}
                {book.offer.delivery.shipping && (
                  <span className={styles.deliveryBadge}>
                    {t('bookDetail.offer.delivery.shipping')}
                  </span>
                )}
              </div>
            </div>
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
