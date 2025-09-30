import { TFunction } from 'i18next'
import React from 'react'

import { ApiBookSearchResult } from '@src/api/books/searchBooks.types'

import styles from '../PublishBookModal.module.scss'
import {
  PublishBookImage,
  PublishBookMetadata,
} from '../PublishBookModal.types'

type IdentifyStepErrors = Partial<
  Record<'title' | 'author' | 'language' | 'format' | 'images', string>
>

type IdentifyStepProps = {
  t: TFunction
  metadata: PublishBookMetadata
  manualMode: boolean
  searchQuery: string
  images: PublishBookImage[]
  errors: IdentifyStepErrors
  results?: ApiBookSearchResult[]
  isFetching: boolean
  isError: boolean
  maxImages: number
  onMetadataChange: (update: Partial<PublishBookMetadata>) => void
  onSearchChange: (value: string) => void
  onManualModeToggle: (checked: boolean) => void
  onResultSelect: (result: ApiBookSearchResult) => void
  onFiles: (files: FileList | null) => void
  onRemoveImage: (id: string) => void
  onRetry: () => void
  onBlur: React.FocusEventHandler<HTMLElement>
}

export const IdentifyStep: React.FC<IdentifyStepProps> = React.memo(
  ({
    t,
    metadata,
    manualMode,
    searchQuery,
    images,
    errors,
    results,
    isFetching,
    isError,
    maxImages,
    onMetadataChange,
    onSearchChange,
    onManualModeToggle,
    onResultSelect,
    onFiles,
    onRemoveImage,
    onRetry,
    onBlur,
  }) => {
    const imagesCount = images.length

    return (
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
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onBlur={onBlur}
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
                onClick={onRetry}
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
                    <div className={styles.searchCover} aria-hidden="true" />
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
                    onClick={() => onResultSelect(book)}
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
              checked={manualMode}
              onChange={(event) => onManualModeToggle(event.target.checked)}
            />
            <label htmlFor="publish-manual" className={styles.switchLabel}>
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
              value={metadata.title}
              onChange={(event) =>
                onMetadataChange({ title: event.target.value })
              }
              onBlur={onBlur}
              required
              aria-invalid={errors.title ? 'true' : 'false'}
            />
            {errors.title && (
              <span className={styles.error} role="alert">
                {errors.title}
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
              value={metadata.author}
              onChange={(event) =>
                onMetadataChange({ author: event.target.value })
              }
              onBlur={onBlur}
              required
              aria-invalid={errors.author ? 'true' : 'false'}
            />
            {errors.author && (
              <span className={styles.error} role="alert">
                {errors.author}
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
              value={metadata.language}
              onChange={(event) =>
                onMetadataChange({ language: event.target.value })
              }
              onBlur={onBlur}
              required
              aria-invalid={errors.language ? 'true' : 'false'}
            />
            {errors.language && (
              <span className={styles.error} role="alert">
                {errors.language}
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
              value={metadata.format}
              onChange={(event) =>
                onMetadataChange({ format: event.target.value })
              }
              onBlur={onBlur}
              required
              aria-invalid={errors.format ? 'true' : 'false'}
            />
            {errors.format && (
              <span className={styles.error} role="alert">
                {errors.format}
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
              value={metadata.publisher}
              onChange={(event) =>
                onMetadataChange({ publisher: event.target.value })
              }
              onBlur={onBlur}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="publish-year">{t('publishBook.fields.year')}</label>
            <input
              id="publish-year"
              className={styles.input}
              value={metadata.year}
              onChange={(event) =>
                onMetadataChange({ year: event.target.value })
              }
              onBlur={onBlur}
              inputMode="numeric"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="publish-isbn">{t('publishBook.fields.isbn')}</label>
            <input
              id="publish-isbn"
              className={styles.input}
              value={metadata.isbn}
              onChange={(event) =>
                onMetadataChange({ isbn: event.target.value })
              }
              onBlur={onBlur}
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
                onFiles(event.dataTransfer.files)
              }}
            >
              <p>{t('publishBook.uploader.title')}</p>
              <span className={styles.uploadHint}>
                {t('publishBook.uploader.hint', {
                  count: maxImages,
                })}
              </span>
              <label className={styles.uploadButton} htmlFor="publish-upload">
                {t('publishBook.uploader.cta')}
              </label>
              <input
                id="publish-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => onFiles(event.target.files)}
              />
            </div>
            {errors.images && (
              <span className={styles.error} role="alert">
                {errors.images}
              </span>
            )}
          </div>
          {imagesCount > 0 && (
            <div className={styles.previews}>
              {images.map((image) => (
                <figure key={image.id} className={styles.previewItem}>
                  <img src={image.url} alt={t('publishBook.previewAlt')} />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() => onRemoveImage(image.id)}
                    aria-label={t('publishBook.uploader.remove') ?? ''}
                  >
                    ×
                  </button>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)

IdentifyStep.displayName = 'IdentifyStep'
