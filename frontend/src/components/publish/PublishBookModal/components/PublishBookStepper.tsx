import { PublishStepper } from '@components/publish/shared'
import React from 'react'

import { PublishBookStep } from '../PublishBookModal.types'

type PublishBookStepperProps = {
  steps: { id: string; label: string; description?: string }[]
  currentStep: PublishBookStep
  ariaLabel: string
}

export const PublishBookStepper: React.FC<PublishBookStepperProps> = React.memo(
  ({ steps, currentStep, ariaLabel }) => (
    <PublishStepper
      steps={steps}
      currentStepId={currentStep}
      ariaLabel={ariaLabel}
    />
  )
)

PublishBookStepper.displayName = 'PublishBookStepper'
