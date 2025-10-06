import {
  PublishModal,
  PublishModalActions,
  PublishStepper,
} from '@components/publish/shared'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { DetailsStep } from './components/DetailsStep'
import { LocationStep } from './components/LocationStep'
import { ReviewStep } from './components/ReviewStep'
import styles from './PublishCornerModal.module.scss'
import { useCornerForm } from './useCornerForm'

type PublishCornerModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreated: (cornerId: string) => void
}

export const PublishCornerModal: React.FC<PublishCornerModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation()

  const {
    modalRef,
    state,
    updateState,
    detailsErrors,
    locationErrors,
    stepperSteps,
    leftActions,
    rightActions,
    handlePhotoSelect,
    handleRemovePhoto,
    closeWithConfirmation,
  } = useCornerForm({ isOpen, onClose, onCreated, t })

  if (!isOpen) return null

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('publishCorner.title')}
      subtitle={t('publishCorner.subtitle')}
      onClose={closeWithConfirmation}
      closeLabel={t('publishCorner.actions.cancel')}
      footer={
        <PublishModalActions
          leftActions={leftActions}
          rightActions={rightActions}
        />
      }
    >
      <PublishStepper
        steps={stepperSteps}
        currentStepId={state.step}
        ariaLabel={t('publishCorner.progress')}
      />

      <div className={styles.stepContent}>
        {state.step === 'details' ? (
          <DetailsStep
            t={t}
            state={state}
            errors={detailsErrors}
            onChange={updateState}
          />
        ) : null}

        {state.step === 'location' ? (
          <LocationStep
            t={t}
            state={state}
            errors={locationErrors}
            onChange={updateState}
            onPhotoSelect={handlePhotoSelect}
            onRemovePhoto={handleRemovePhoto}
          />
        ) : null}

        {state.step === 'review' ? <ReviewStep t={t} state={state} /> : null}
      </div>
    </PublishModal>
  )
}
