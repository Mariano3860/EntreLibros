import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishBookModal.module.scss'
import { PublishBookStep } from '../PublishBookModal.types'

type PublishBookStepperProps = {
  currentStep: PublishBookStep
  t: TFunction
  stepOrder: PublishBookStep[]
  stepIndex: Record<PublishBookStep, number>
}

export const PublishBookStepper: React.FC<PublishBookStepperProps> = React.memo(
  ({ currentStep, t, stepOrder, stepIndex }) => (
    <div
      className={styles.stepper}
      role="tablist"
      aria-label={t('publishBook.progress')}
    >
      {stepOrder.map((step) => (
        <div key={step} className={styles.step}>
          <span
            className={`${styles.stepIndicator} ${
              step === currentStep ? styles.stepActive : ''
            }`.trim()}
            aria-hidden="true"
          >
            {stepIndex[step] + 1}
          </span>
          <div>
            <div className={styles.stepLabel}>
              {t(`publishBook.steps.${step}.title`)}
            </div>
            <div className={styles.stepDescription}>
              {t(`publishBook.steps.${step}.description`)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
)

PublishBookStepper.displayName = 'PublishBookStepper'
