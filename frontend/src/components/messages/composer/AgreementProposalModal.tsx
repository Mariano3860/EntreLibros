import { FormEvent, RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AgreementDetails, Book } from '../Messages.types'

import styles from './ComposerForm.module.scss'
import { ComposerModal } from './ComposerModal'

type AgreementProposalModalProps = {
  open: boolean
  myBooks: Book[]
  theirBooks: Book[]
  counterpartName: string
  onClose: () => void
  onConfirm: (details: AgreementDetails) => void
}

export const AgreementProposalModal = ({
  open,
  myBooks,
  theirBooks,
  counterpartName,
  onClose,
  onConfirm,
}: AgreementProposalModalProps) => {
  const { t } = useTranslation()
  const meetingPointRef = useRef<HTMLInputElement>(null)
  const [meetingPoint, setMeetingPoint] = useState('')
  const [area, setArea] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [bookId, setBookId] = useState('')

  useEffect(() => {
    if (!open) return

    setMeetingPoint('')
    setArea('')
    setDate('')
    setTime('')
    const fallbackBook = myBooks[0] ?? theirBooks[0]
    setBookId(fallbackBook?.id ?? '')
  }, [open, myBooks, theirBooks])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const selectedBook =
      myBooks.find((book) => book.id === bookId) ??
      theirBooks.find((book) => book.id === bookId)

    if (!selectedBook) return

    onConfirm({
      meetingPoint: meetingPoint.trim(),
      area: area.trim(),
      date: date.trim(),
      time: time.trim(),
      bookTitle: selectedBook.title,
    })
    onClose()
  }

  const allBooks = [...myBooks, ...theirBooks]
  const canSubmit = Boolean(
    meetingPoint.trim() &&
      area.trim() &&
      date.trim() &&
      time.trim() &&
      bookId &&
      allBooks.some((book) => book.id === bookId)
  )

  return (
    <ComposerModal
      open={open}
      title={t('community.messages.composer.agreementModal.title', {
        defaultValue: 'Propuesta de acuerdo',
      })}
      description={t('community.messages.composer.agreementModal.description', {
        defaultValue:
          'Definí un punto de encuentro y horario para cerrar el intercambio.',
      })}
      closeLabel={t('community.messages.composer.close', {
        defaultValue: 'Cerrar',
      })}
      onClose={onClose}
      initialFocusRef={meetingPointRef as RefObject<HTMLElement>}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-agreement-meeting">
            {t('community.messages.composer.agreementModal.meetingLabel', {
              defaultValue: 'Punto de encuentro',
            })}
          </label>
          <input
            id="composer-agreement-meeting"
            ref={meetingPointRef}
            className={styles.input}
            value={meetingPoint}
            onChange={(event) => setMeetingPoint(event.target.value)}
            placeholder={t(
              'community.messages.composer.agreementModal.meetingPlaceholder',
              {
                defaultValue: 'Ej. Café de la plaza',
              }
            )}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-agreement-area">
            {t('community.messages.composer.agreementModal.areaLabel', {
              defaultValue: 'Zona o barrio',
            })}
          </label>
          <input
            id="composer-agreement-area"
            className={styles.input}
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder={t(
              'community.messages.composer.agreementModal.areaPlaceholder',
              {
                defaultValue: 'Ej. Nervión (Sevilla)',
              }
            )}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-agreement-date">
            {t('community.messages.composer.agreementModal.dateLabel', {
              defaultValue: 'Día sugerido',
            })}
          </label>
          <input
            id="composer-agreement-date"
            className={styles.input}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            placeholder={t(
              'community.messages.composer.agreementModal.datePlaceholder',
              {
                defaultValue: 'Ej. Martes 12/03',
              }
            )}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-agreement-time">
            {t('community.messages.composer.agreementModal.timeLabel', {
              defaultValue: 'Horario',
            })}
          </label>
          <input
            id="composer-agreement-time"
            className={styles.input}
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder={t(
              'community.messages.composer.agreementModal.timePlaceholder',
              {
                defaultValue: 'Ej. 19:00',
              }
            )}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-agreement-book">
            {t('community.messages.composer.agreementModal.bookLabel', {
              defaultValue: 'Libro a intercambiar',
            })}
          </label>
          <select
            id="composer-agreement-book"
            className={styles.select}
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            required
          >
            {allBooks.length > 0 ? null : (
              <option value="">
                {t('community.messages.composer.agreementModal.noBooks', {
                  defaultValue: 'No hay libros cargados en la conversación.',
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
            disabled={!canSubmit}
          >
            {t('community.messages.composer.agreementModal.submit', {
              defaultValue: 'Enviar propuesta',
            })}
          </button>
        </div>
      </form>
    </ComposerModal>
  )
}
