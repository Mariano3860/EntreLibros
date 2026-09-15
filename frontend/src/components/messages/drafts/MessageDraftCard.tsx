import type {
  ApiMessageDraft,
  ApiMessageDraftAttachment,
} from '@api/messages/messages'
import { useTranslation } from 'react-i18next'

import { BookCover } from '@src/components/ui/presentation/Presentation'
import type { BookCardView } from '@src/mocks/fixtures/experience'

import styles from './MessageDraftCard.module.scss'

type MessageDraftCardProps = {
  draft: ApiMessageDraft
  onEdit: () => void
  onDiscard: () => void
  onSend: () => void
  isDiscarding?: boolean
  isSending?: boolean
}

const toBook = (
  book: {
    id?: string
    bookId?: string
    title: string
    author: string
    coverUrl: string
  },
  genre: string,
  accent = '#42d7c7'
): BookCardView => ({
  id: book.id ?? book.bookId ?? 'draft-book',
  title: book.title,
  author: book.author,
  owner: '',
  distance: '',
  mode: 'Intercambio',
  accent,
  genre,
  coverUrl: book.coverUrl,
})

const DraftBook = ({
  book,
  label,
}: {
  book: {
    id?: string
    bookId?: string
    title: string
    author: string
    coverUrl: string
  }
  label: string
}) => {
  const { t } = useTranslation()
  return (
    <div className={styles.bookCard} aria-label={`${label}: ${book.title}`}>
      <span className={styles.bookLabel}>{label}</span>
      <BookCover
        compact
        book={toBook(book, t('community.messages.drafts.book'))}
      />
      <div className={styles.bookCopy}>
        <strong>{book.title}</strong>
        <span>{book.author}</span>
        <small>
          <i aria-hidden="true" />
          {t('community.messages.drafts.bookAttached', {
            defaultValue: 'Libro adjunto',
          })}
        </small>
      </div>
    </div>
  )
}

const DraftContent = ({
  attachment,
}: {
  attachment: ApiMessageDraftAttachment
}) => {
  const { t } = useTranslation()
  if (attachment.kind === 'book') {
    return (
      <div className={styles.singleContent}>
        <DraftBook
          book={attachment}
          label={t('community.messages.drafts.book')}
        />
      </div>
    )
  }
  if (attachment.kind === 'swap') {
    return (
      <div className={styles.swapContent}>
        <DraftBook
          book={attachment.offered}
          label={t('community.messages.drafts.offered', {
            defaultValue: 'Ofrecés',
          })}
        />
        <span className={styles.swapArrow} aria-hidden="true">
          ⇄
        </span>
        <DraftBook
          book={attachment.requested}
          label={t('community.messages.drafts.requested', {
            defaultValue: 'Querés recibir',
          })}
        />
      </div>
    )
  }
  return (
    <div className={styles.agreementContent}>
      <div className={styles.agreementIcon} aria-hidden="true">
        ◇
      </div>
      <div>
        <strong>{attachment.details.bookTitle}</strong>
        <span>
          {attachment.details.meetingPoint} · {attachment.details.area}
        </span>
        <span>
          {attachment.details.date} · {attachment.details.time}
        </span>
      </div>
    </div>
  )
}

export const MessageDraftCard = ({
  draft,
  onEdit,
  onDiscard,
  onSend,
  isDiscarding = false,
  isSending = false,
}: MessageDraftCardProps) => {
  const { t } = useTranslation()
  const attachment = draft.attachmentMetadata
  if (!attachment) return null
  const title =
    attachment.kind === 'book'
      ? t('community.messages.drafts.bookTitle', {
          defaultValue: 'Libro adjunto',
        })
      : attachment.kind === 'swap'
        ? t('community.messages.drafts.swapTitle', {
            defaultValue: 'Propuesta de intercambio',
          })
        : t('community.messages.drafts.agreementTitle', {
            defaultValue: 'Propuesta de acuerdo',
          })
  const sendLabel =
    attachment?.kind === 'swap' || attachment?.kind === 'agreementProposal'
      ? t('community.messages.drafts.sendProposal', {
          defaultValue: 'Enviar propuesta',
        })
      : t('community.messages.drafts.send', { defaultValue: 'Enviar' })

  return (
    <article
      className={styles.card}
      aria-label={t('community.messages.drafts.ariaLabel', {
        defaultValue: 'Borrador: {{title}}',
        title,
      })}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.badge}>
            {t('community.messages.drafts.label', { defaultValue: 'Borrador' })}
          </span>
          <strong>{title}</strong>
        </div>
        <span className={styles.privacy}>
          <span aria-hidden="true">▣</span>
          {t('community.messages.drafts.private', {
            defaultValue: 'Solo vos ves este borrador hasta enviarlo',
          })}
        </span>
      </header>
      <div className={styles.content}>
        <DraftContent attachment={attachment} />
      </div>
      <footer className={styles.footer}>
        <div className={styles.secondaryActions}>
          <button type="button" onClick={onEdit} disabled={isSending}>
            {t('community.messages.drafts.edit', { defaultValue: 'Editar' })}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isDiscarding || isSending}
          >
            {t('community.messages.drafts.discard', {
              defaultValue: 'Descartar',
            })}
          </button>
        </div>
        <button
          type="button"
          className={styles.sendButton}
          onClick={onSend}
          disabled={isSending || isDiscarding}
        >
          {isSending
            ? t('community.messages.drafts.sending', {
                defaultValue: 'Enviando…',
              })
            : sendLabel}
        </button>
      </footer>
    </article>
  )
}
