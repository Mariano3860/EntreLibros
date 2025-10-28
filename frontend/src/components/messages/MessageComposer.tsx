import { cx } from '@utils/cx'
import {
  FormEvent,
  KeyboardEvent,
  RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { AgreementProposalModal } from './composer/AgreementProposalModal'
import { AttachBookModal } from './composer/AttachBookModal'
import { SwapProposalModal } from './composer/SwapProposalModal'
import styles from './MessageComposer.module.scss'
import { AgreementDetails, Book, SwapProposalDetails } from './Messages.types'

type ActiveModal = 'book' | 'swap' | 'agreement' | null

type MessageComposerProps = {
  className?: string
  disabled?: boolean
  onSendText: (text: string) => void
  onAttachBook: (bookId: string, note?: string) => void
  onProposeSwap: (details: SwapProposalDetails) => void
  onProposeAgreement: (proposal: AgreementDetails) => void
  myBooks: Book[]
  theirBooks: Book[]
  counterpartName: string
  conversationId: number
}

const EMOJIS = ['😀', '😁', '😂', '😍', '🤔', '👍', '🎉', '📚']

export const MessageComposer = ({
  className,
  disabled,
  onSendText,
  onAttachBook,
  onProposeSwap,
  onProposeAgreement,
  myBooks,
  theirBooks,
  counterpartName,
  conversationId,
}: MessageComposerProps) => {
  const { t } = useTranslation()
  const textareaId = useId()
  const [draft, setDraft] = useState('')
  const [isEmojiOpen, setEmojiOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiTriggerRef = useRef<HTMLButtonElement>(null)
  const emojiPopoverRef = useRef<HTMLDivElement>(null)
  const bookButtonRef = useRef<HTMLButtonElement>(null)
  const swapButtonRef = useRef<HTMLButtonElement>(null)
  const agreementButtonRef = useRef<HTMLButtonElement>(null)
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)

  const closeEmojiPicker = () => {
    setEmojiOpen(false)
  }

  const sendDraft = () => {
    if (disabled) return
    const cleanDraft = draft.trim()
    if (!cleanDraft) return

    onSendText(cleanDraft)
    setDraft('')
    closeEmojiPicker()
    textareaRef.current?.focus()
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendDraft()
  }

  const handleToggleEmoji = () => {
    if (disabled) return
    setEmojiOpen((prev) => {
      const next = !prev
      if (next) {
        requestAnimationFrame(() => {
          textareaRef.current?.focus()
        })
      }
      return next
    })
  }

  const handleEmojiSelect = (emoji: string) => {
    if (disabled || !emoji) return
    const textarea = textareaRef.current
    if (!textarea) return

    const selectionStart = textarea.selectionStart ?? draft.length
    const selectionEnd = textarea.selectionEnd ?? draft.length
    const nextValue =
      draft.slice(0, selectionStart) + emoji + draft.slice(selectionEnd)
    setDraft(nextValue)

    const cursorPosition = selectionStart + emoji.length
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  const handleOpenModal = (
    type: Exclude<ActiveModal, null>,
    triggerRef: RefObject<HTMLButtonElement | null>
  ) => {
    if (disabled) return
    modalTriggerRef.current = triggerRef.current
    closeEmojiPicker()
    setActiveModal(type)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    const trigger = modalTriggerRef.current
    if (trigger) {
      requestAnimationFrame(() => {
        trigger.focus()
      })
    }
  }

  const handleAttachBookConfirm = (bookId: string, note?: string) => {
    onAttachBook(bookId, note)
  }

  const handleSwapConfirm = (details: SwapProposalDetails) => {
    onProposeSwap(details)
  }

  const handleAgreementConfirm = (proposal: AgreementDetails) => {
    onProposeAgreement(proposal)
  }

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      sendDraft()
    }
  }

  useEffect(() => {
    if (!isEmojiOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!emojiPopoverRef.current) return
      const target = event.target as Node | null
      if (
        target &&
        !emojiPopoverRef.current.contains(target) &&
        !emojiTriggerRef.current?.contains(target)
      ) {
        closeEmojiPicker()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEmojiOpen])

  useEffect(() => {
    if (!disabled) return
    closeEmojiPicker()
    setActiveModal(null)
  }, [disabled])

  useEffect(() => {
    closeEmojiPicker()
    setActiveModal(null)
  }, [conversationId])

  const hasDraft = draft.trim().length > 0

  return (
    <>
      <form
        className={cx(className, styles.composer)}
        onSubmit={handleFormSubmit}
        aria-disabled={disabled}
      >
        <div className={styles.editor}>
          <label className={styles.hiddenLabel} htmlFor={textareaId}>
            {t('community.messages.composer.textLabel', {
              defaultValue: 'Escribí tu mensaje',
            })}
          </label>
          <textarea
            id={textareaId}
            ref={textareaRef}
            className={styles.textarea}
            placeholder={t('community.messages.composer.placeholder', {
              defaultValue: 'Escribí un mensaje...',
            })}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            disabled={disabled}
            aria-disabled={disabled}
          />
          {isEmojiOpen ? (
            <div
              ref={emojiPopoverRef}
              className={styles.emojiPopover}
              id={`${textareaId}-emoji-popover`}
            >
              <div className={styles.emojiClose}>
                <button
                  type="button"
                  className={styles.closeEmojiButton}
                  onClick={closeEmojiPicker}
                >
                  {t('community.messages.composer.emoji.close', {
                    defaultValue: 'Cerrar selector',
                  })}
                </button>
              </div>
              <div className={styles.emojiList}>
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={styles.emojiButton}
                    onClick={() => handleEmojiSelect(emoji)}
                    aria-label={t('community.messages.composer.emoji.insert', {
                      defaultValue: 'Insertar emoji {{emoji}}',
                      emoji,
                    })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <button
                type="button"
                ref={emojiTriggerRef}
                className={styles.actionButton}
                onClick={handleToggleEmoji}
                aria-expanded={isEmojiOpen}
                aria-controls={
                  isEmojiOpen ? `${textareaId}-emoji-popover` : undefined
                }
                disabled={disabled}
              >
                {t('community.messages.composer.emoji.open', {
                  defaultValue: 'Emoji',
                })}
              </button>
              <button
                type="button"
                ref={bookButtonRef}
                className={styles.actionButton}
                onClick={() => handleOpenModal('book', bookButtonRef)}
                disabled={disabled}
              >
                {t('community.messages.composer.bookModal.trigger', {
                  defaultValue: 'Adjuntar libro',
                })}
              </button>
              <button
                type="button"
                ref={swapButtonRef}
                className={styles.actionButton}
                onClick={() => handleOpenModal('swap', swapButtonRef)}
                disabled={disabled}
              >
                {t('community.messages.composer.swapModal.trigger', {
                  defaultValue: 'Proponer intercambio',
                })}
              </button>
              <button
                type="button"
                ref={agreementButtonRef}
                className={styles.actionButton}
                onClick={() => handleOpenModal('agreement', agreementButtonRef)}
                disabled={disabled}
              >
                {t('community.messages.composer.agreementModal.trigger', {
                  defaultValue: 'Propuesta de acuerdo',
                })}
              </button>
            </div>
            <div className={styles.toolbarGroup}>
              <button
                type="submit"
                className={styles.sendButton}
                disabled={disabled || !hasDraft}
                aria-label={t('community.messages.composer.send', {
                  defaultValue: 'Enviar mensaje',
                })}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </form>

      <AttachBookModal
        open={activeModal === 'book'}
        myBooks={myBooks}
        theirBooks={theirBooks}
        counterpartName={counterpartName}
        onClose={handleCloseModal}
        onConfirm={handleAttachBookConfirm}
      />
      <SwapProposalModal
        open={activeModal === 'swap'}
        myBooks={myBooks}
        theirBooks={theirBooks}
        counterpartName={counterpartName}
        onClose={handleCloseModal}
        onConfirm={handleSwapConfirm}
      />
      <AgreementProposalModal
        open={activeModal === 'agreement'}
        myBooks={myBooks}
        theirBooks={theirBooks}
        counterpartName={counterpartName}
        onClose={handleCloseModal}
        onConfirm={handleAgreementConfirm}
      />
    </>
  )
}
