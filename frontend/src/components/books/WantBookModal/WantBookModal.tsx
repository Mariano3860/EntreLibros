import { PublishModal } from '@components/publish/shared/PublishModal/PublishModal'
import { useBookSearch } from '@hooks/api/useBookSearch'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { createWantBook } from '@src/api/books/bookInteractions.service'
import type {
  CreateWantBookPayload,
  PublishBookResponse,
} from '@src/api/books/publishBook.types'
import type { ApiBookSearchResult } from '@src/api/books/searchBooks.types'

import styles from './WantBookModal.module.scss'

export type WantBookSource = {
  title: string
  author: string
  publisher?: string
  year?: number
  language?: string
  format?: string
  isbn?: string
  coverUrl?: string
}

type WantBookModalProps = {
  isOpen: boolean
  initialBook?: WantBookSource
  onClose: () => void
  onCreated: (book: PublishBookResponse) => void
}

type WantBookForm = {
  title: string
  author: string
  publisher: string
  year: string
  language: string
  format: string
  isbn: string
  coverUrl: string
  notes: string
}

const formFromBook = (book?: WantBookSource): WantBookForm => ({
  title: book?.title ?? '',
  author: book?.author ?? '',
  publisher: book?.publisher ?? '',
  year: book?.year ? String(book.year) : '',
  language: book?.language ?? '',
  format: book?.format ?? '',
  isbn: book?.isbn ?? '',
  coverUrl: book?.coverUrl ?? '',
  notes: '',
})

export const WantBookModal: React.FC<WantBookModalProps> = ({
  isOpen,
  initialBook,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<WantBookForm>(() =>
    formFromBook(initialBook)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const { data: results, isFetching, isError } = useBookSearch(searchQuery)
  const mutation = useMutation({ mutationFn: createWantBook })

  useEffect(() => {
    if (!isOpen) return
    setForm(formFromBook(initialBook))
    setSearchQuery('')
  }, [initialBook, isOpen])

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen,
    onEscape: onClose,
  })

  const updateField = (field: keyof WantBookForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleResultSelect = (result: ApiBookSearchResult) => {
    setForm((current) => ({
      ...current,
      title: result.title,
      author: result.author,
      publisher: result.publisher ?? '',
      year: result.year ? String(result.year) : '',
      language: result.language ?? '',
      format: result.format ?? '',
      isbn: result.isbn ?? '',
      coverUrl: result.coverUrl ?? '',
    }))
    setSearchQuery('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: CreateWantBookPayload = {
      type: 'want',
      metadata: {
        title: form.title.trim(),
        author: form.author.trim(),
        publisher: form.publisher.trim() || undefined,
        year: form.year.trim() ? Number(form.year) : null,
        language: form.language.trim() || undefined,
        format: form.format.trim() || undefined,
        isbn: form.isbn.trim() || undefined,
        coverUrl: form.coverUrl.trim() || undefined,
      },
      notes: form.notes.trim() || undefined,
    }

    try {
      const created = await mutation.mutateAsync(payload)
      toast.success(t('booksPage.want.created'))
      onCreated(created)
      onClose()
    } catch (error) {
      const responseStatus = (error as { response?: { status?: number } })
        .response?.status
      toast.error(
        t(
          responseStatus === 409
            ? 'booksPage.want.duplicate'
            : 'booksPage.want.error'
        )
      )
    }
  }

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('booksPage.want.title')}
      subtitle={t('booksPage.want.subtitle')}
      onClose={onClose}
      closeLabel={t('booksPage.want.cancel')}
      className={styles.modal}
      footer={
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t('booksPage.want.cancel')}
          </button>
          <button
            type="submit"
            form="want-book-form"
            className={styles.primaryAction}
            disabled={!form.title.trim() || mutation.isPending}
          >
            {mutation.isPending
              ? t('booksPage.want.saving')
              : t('booksPage.want.submit')}
          </button>
        </div>
      }
    >
      <form id="want-book-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.searchBlock}>
          <label htmlFor="want-book-search">{t('booksPage.want.search')}</label>
          <input
            id="want-book-search"
            type="search"
            value={searchQuery}
            placeholder={t('booksPage.want.searchPlaceholder')}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {isFetching ? (
            <span className={styles.status}>
              {t('booksPage.want.searching')}
            </span>
          ) : null}
          {isError ? (
            <span className={styles.error}>
              {t('booksPage.want.searchError')}
            </span>
          ) : null}
          {results && searchQuery.trim().length >= 3 && results.length > 0 ? (
            <div className={styles.results} role="listbox">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  role="option"
                  onClick={() => handleResultSelect(result)}
                >
                  <span>
                    <strong>{result.title}</strong>
                    <small>
                      {result.author}
                      {result.year ? ` · ${result.year}` : ''}
                    </small>
                  </span>
                  <span aria-hidden="true">+</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.formGrid}>
          <label>
            {t('booksPage.want.titleLabel')}
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
          </label>
          <label>
            {t('booksPage.want.authorLabel')}
            <input
              value={form.author}
              onChange={(event) => updateField('author', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.publisherLabel')}
            <input
              value={form.publisher}
              onChange={(event) => updateField('publisher', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.yearLabel')}
            <input
              inputMode="numeric"
              value={form.year}
              onChange={(event) => updateField('year', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.languageLabel')}
            <input
              value={form.language}
              onChange={(event) => updateField('language', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.formatLabel')}
            <input
              value={form.format}
              onChange={(event) => updateField('format', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.isbnLabel')}
            <input
              value={form.isbn}
              onChange={(event) => updateField('isbn', event.target.value)}
            />
          </label>
          <label>
            {t('booksPage.want.coverLabel')}
            <input
              type="url"
              value={form.coverUrl}
              onChange={(event) => updateField('coverUrl', event.target.value)}
            />
          </label>
        </div>

        <label className={styles.notes}>
          {t('booksPage.want.notesLabel')}
          <textarea
            value={form.notes}
            placeholder={t('booksPage.want.notesPlaceholder')}
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </label>
      </form>
    </PublishModal>
  )
}
