import { FormEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Book } from '../Messages.types'

import styles from './ComposerForm.module.scss'
import { ComposerModal } from './ComposerModal'

type AttachBookModalProps = {
  open: boolean
  myBooks: Book[]
  theirBooks: Book[]
  counterpartName: string
  onClose: () => void
  onConfirm: (bookId: string, note?: string) => void
}

export const AttachBookModal = ({
  open,
  myBooks,
  theirBooks,
  counterpartName,
  onClose,
  onConfirm,
}: AttachBookModalProps) => {
  const { t } = useTranslation()
  const selectRef = useRef<HTMLSelectElement>(null)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return

    const firstBook = myBooks[0] ?? theirBooks[0]
    setSelectedBookId(firstBook?.id ?? '')
    setNote('')
  }, [open, myBooks, theirBooks])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedBookId) return

    const cleanNote = note.trim()
    onConfirm(selectedBookId, cleanNote ? cleanNote : undefined)
    onClose()
  }

  const hasBooks = myBooks.length > 0 || theirBooks.length > 0

  return (
    <ComposerModal
      open={open}
      title={t('community.messages.composer.bookModal.title', {
        defaultValue: 'Adjuntar libro',
      })}
      description={t('community.messages.composer.bookModal.description', {
        defaultValue: 'Compartí una ficha de libro dentro de la conversación.',
      })}
      closeLabel={t('community.messages.composer.close', {
        defaultValue: 'Cerrar',
      })}
      onClose={onClose}
      initialFocusRef={selectRef}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-book-select">
            {t('community.messages.composer.bookModal.bookLabel', {
              defaultValue: 'Elegí un libro',
            })}
          </label>
          <select
            id="composer-book-select"
            ref={selectRef}
            className={styles.select}
            value={selectedBookId}
            onChange={(event) => setSelectedBookId(event.target.value)}
            required
          >
            {hasBooks ? null : (
              <option value="">
                {t('community.messages.composer.bookModal.empty', {
                  defaultValue: 'No hay libros disponibles',
                })}
              </option>
            )}
            {myBooks.length > 0 ? (
              <optgroup
                label={t('community.messages.composer.bookModal.mine', {
                  defaultValue: 'Mis libros',
                })}
              >
                {myBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {theirBooks.length > 0 ? (
              <optgroup
                label={t('community.messages.composer.bookModal.theirs', {
                  defaultValue: 'Libros de {{name}}',
                  name: counterpartName,
                })}
              >
                {theirBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
          <p className={styles.helperText}>
            {t('community.messages.composer.bookModal.helper', {
              defaultValue: 'Podés añadir una nota opcional para darle contexto.',
            })}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-book-note">
            {t('community.messages.composer.bookModal.noteLabel', {
              defaultValue: 'Nota (opcional)',
            })}
          </label>
          <textarea
            id="composer-book-note"
            className={styles.textarea}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={onClose}
          >
            {t('community.messages.composer.cancel', {
              defaultValue: 'Cancelar',
            })}
          </button>
          <button
            type="submit"
            className={styles.buttonPrimary}
            disabled={!selectedBookId}
          >
            {t('community.messages.composer.bookModal.submit', {
              defaultValue: 'Adjuntar',
            })}
          </button>
        </div>
      </form>
    </ComposerModal>
  )
}
