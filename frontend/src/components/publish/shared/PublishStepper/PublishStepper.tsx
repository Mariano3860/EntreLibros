import React from 'react'

import styles from './PublishStepper.module.scss'

type PublishStepperStep = {
  id: string
  label: string
  description?: string
}

type PublishStepperProps = {
  steps: PublishStepperStep[]
  currentStepId: string
  ariaLabel: string
}

export const PublishStepper: React.FC<PublishStepperProps> = ({
  steps,
  currentStepId,
  ariaLabel,
}) => {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId)

  return (
    <div className={styles.stepper} role="tablist" aria-label={ariaLabel}>
      {steps.map((step, index) => (
        <div key={step.id} className={styles.step} role="presentation">
          <span
            className={`${styles.stepIndicator} ${
              index === currentIndex ? styles.stepActive : ''
            }`.trim()}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div>
            <div className={styles.stepLabel}>{step.label}</div>
            {step.description ? (
              <div className={styles.stepDescription}>{step.description}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
