import { PublishFileUpload, PublishTextField } from '@components/publish/shared'
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
    return (
      <div className={styles.stepLayout}>
        <div>
          <PublishTextField
            id="publish-search"
            type="search"
            label={t('publishBook.search.label')}
            placeholder={t('publishBook.search.placeholder') ?? ''}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onBlur={onBlur}
            containerClassName={styles.formGroup}
          />
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
          <PublishTextField
            id="publish-title"
            label={t('publishBook.fields.title')}
            value={metadata.title}
            onChange={(event) =>
              onMetadataChange({ title: event.target.value })
            }
            onBlur={onBlur}
            required
            error={errors.title}
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-author"
            label={t('publishBook.fields.author')}
            value={metadata.author}
            onChange={(event) =>
              onMetadataChange({ author: event.target.value })
            }
            onBlur={onBlur}
            required
            error={errors.author}
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-language"
            label={t('publishBook.fields.language')}
            value={metadata.language}
            onChange={(event) =>
              onMetadataChange({ language: event.target.value })
            }
            onBlur={onBlur}
            required
            error={errors.language}
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-format"
            label={t('publishBook.fields.format')}
            value={metadata.format}
            onChange={(event) =>
              onMetadataChange({ format: event.target.value })
            }
            onBlur={onBlur}
            required
            error={errors.format}
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-publisher"
            label={t('publishBook.fields.publisher')}
            value={metadata.publisher}
            onChange={(event) =>
              onMetadataChange({ publisher: event.target.value })
            }
            onBlur={onBlur}
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-year"
            label={t('publishBook.fields.year')}
            value={metadata.year}
            onChange={(event) => onMetadataChange({ year: event.target.value })}
            onBlur={onBlur}
            inputMode="numeric"
            containerClassName={styles.formGroup}
          />
          <PublishTextField
            id="publish-isbn"
            label={t('publishBook.fields.isbn')}
            value={metadata.isbn}
            onChange={(event) => onMetadataChange({ isbn: event.target.value })}
            onBlur={onBlur}
            containerClassName={styles.formGroup}
          />
        </div>

        <div>
          <PublishFileUpload
            id="publish-upload"
            label={t('publishBook.fields.images')}
            buttonLabel={t('publishBook.uploader.cta')}
            hint={t('publishBook.uploader.hint', { count: maxImages })}
            accept="image/*"
            multiple
            previews={images.map((image) => ({
              id: image.id,
              url: image.url,
              alt: t('publishBook.previewAlt'),
            }))}
            onFilesSelected={(files) => onFiles(files)}
            onDropFiles={(files) => onFiles(files)}
            onRemoveFile={onRemoveImage}
            removeLabel={t('publishBook.uploader.remove') ?? ''}
            error={errors.images}
            containerClassName={styles.formGroup}
          />
        </div>
      </div>
    )
  }
)

IdentifyStep.displayName = 'IdentifyStep'
