import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishBookModal.module.scss'

type ResumeDraftPromptProps = {
  t: TFunction
  onDiscard: () => void
  onResume: () => void
}

export const ResumeDraftPrompt: React.FC<ResumeDraftPromptProps> = React.memo(
  ({ t, onDiscard, onResume }) => (
    <div className={styles.resumePrompt} role="dialog" aria-modal="true">
      <h2>{t('publishBook.resume.title')}</h2>
      <p>{t('publishBook.resume.description')}</p>
      <div className={styles.resumeActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onDiscard}
        >
          {t('publishBook.resume.discard')}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onResume}
        >
          {t('publishBook.resume.continue')}
        </button>
      </div>
    </div>
  )
)

ResumeDraftPrompt.displayName = 'ResumeDraftPrompt'
