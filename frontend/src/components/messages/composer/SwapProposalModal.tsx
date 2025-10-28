import { FormEvent, RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Book, SwapProposalDetails } from '../Messages.types'

import styles from './ComposerForm.module.scss'
import { ComposerModal } from './ComposerModal'

type SwapProposalModalProps = {
  open: boolean
  myBooks: Book[]
  theirBooks: Book[]
  counterpartName: string
  onClose: () => void
  onConfirm: (details: SwapProposalDetails) => void
}

export const SwapProposalModal = ({
  open,
  myBooks,
  theirBooks,
  onClose,
  onConfirm,
}: SwapProposalModalProps) => {
  const { t } = useTranslation()
  const offeredRef = useRef<HTMLSelectElement>(null)
  const [offeredId, setOfferedId] = useState('')
  const [requestedId, setRequestedId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return

    setOfferedId(myBooks[0]?.id ?? '')
    setRequestedId(theirBooks[0]?.id ?? '')
    setNote('')
  }, [open, myBooks, theirBooks])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const offered = myBooks.find((book) => book.id === offeredId)
    const requested = theirBooks.find((book) => book.id === requestedId)
    if (!offered || !requested) return

    const cleanNote = note.trim()
    onConfirm({
      offered,
      requested,
      note: cleanNote ? cleanNote : undefined,
    })
    onClose()
  }

  const canSubmit = Boolean(offeredId && requestedId)

  return (
    <ComposerModal
      open={open}
      title={t('community.messages.composer.swapModal.title', {
        defaultValue: 'Propuesta de intercambio',
      })}
      description={t('community.messages.composer.swapModal.description', {
        defaultValue:
          'Elegí qué libro ofrecés y cuál te gustaría recibir a cambio.',
      })}
      closeLabel={t('community.messages.composer.close', {
        defaultValue: 'Cerrar',
      })}
      onClose={onClose}
      initialFocusRef={offeredRef as RefObject<HTMLElement>}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-swap-offered">
            {t('community.messages.composer.swapModal.offeredLabel', {
              defaultValue: 'Ofrecés',
            })}
          </label>
          <select
            id="composer-swap-offered"
            ref={offeredRef}
            className={styles.select}
            value={offeredId}
            onChange={(event) => setOfferedId(event.target.value)}
            required
          >
            {myBooks.length > 0 ? null : (
              <option value="">
                {t('community.messages.composer.swapModal.noMine', {
                  defaultValue: 'No tenés libros disponibles para intercambio.',
                })}
              </option>
            )}
            {myBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-swap-requested">
            {t('community.messages.composer.swapModal.requestedLabel', {
              defaultValue: 'Querés recibir',
            })}
          </label>
          <select
            id="composer-swap-requested"
            className={styles.select}
            value={requestedId}
            onChange={(event) => setRequestedId(event.target.value)}
            required
          >
            {theirBooks.length > 0 ? null : (
              <option value="">
                {t('community.messages.composer.swapModal.noTheirs', {
                  defaultValue: 'La otra persona no tiene libros publicados.',
                })}
              </option>
            )}
            {theirBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
          <p className={styles.helperText}>
            {t('community.messages.composer.swapModal.helper', {
              defaultValue:
                'Las propuestas se guardan en la conversación para que ambos las revisen.',
            })}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="composer-swap-note">
            {t('community.messages.composer.swapModal.noteLabel', {
              defaultValue: 'Mensaje adicional (opcional)',
            })}
          </label>
          <textarea
            id="composer-swap-note"
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
            disabled={!canSubmit}
          >
            {t('community.messages.composer.swapModal.submit', {
              defaultValue: 'Enviar propuesta',
            })}
          </button>
        </div>
      </form>
    </ComposerModal>
  )
}
