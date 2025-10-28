import { ReactNode, RefObject, useEffect, useId } from 'react'

import styles from './ComposerModal.module.scss'

type ComposerModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  closeLabel: string
  initialFocusRef?: RefObject<HTMLElement>
}

export const ComposerModal = ({
  open,
  title,
  description,
  children,
  onClose,
  closeLabel,
  initialFocusRef,
}: ComposerModalProps) => {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const focusElement = initialFocusRef?.current
    if (focusElement) {
      requestAnimationFrame(() => {
        focusElement.focus()
      })
    }
  }, [open, initialFocusRef])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            {closeLabel}
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
