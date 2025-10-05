import React, { forwardRef, useId } from 'react'

import { cx } from '@src/utils/cx'

import styles from './PublishModal.module.scss'

type PublishModalProps = {
  isOpen: boolean
  title: string
  subtitle?: string
  onClose?: () => void
  closeLabel?: string
  headerActions?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
  roleDescription?: string
}

export const PublishModal = forwardRef<HTMLDivElement, PublishModalProps>(
  (
    {
      isOpen,
      title,
      subtitle,
      onClose,
      closeLabel,
      headerActions,
      footer,
      children,
      className,
      roleDescription,
    },
    ref
  ) => {
    const titleId = useId()

    if (!isOpen) return null

    return (
      <div className={styles.overlay} role="presentation" aria-hidden={!isOpen}>
        <div
          ref={ref}
          className={cx(styles.modal, className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-roledescription={roleDescription}
        >
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <h2 id={titleId}>{title}</h2>
              {subtitle ? (
                <span className={styles.subtitle}>{subtitle}</span>
              ) : null}
            </div>
            <div className={styles.headerActions}>
              {headerActions}
              {onClose ? (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                >
                  {closeLabel ?? 'Cerrar'}
                </button>
              ) : null}
            </div>
          </header>

          <section className={styles.content}>{children}</section>

          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </div>
      </div>
    )
  }
)

PublishModal.displayName = 'PublishModal'
