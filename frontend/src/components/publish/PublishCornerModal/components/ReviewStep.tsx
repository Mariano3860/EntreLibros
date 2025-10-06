import { PublishReviewCard } from '@components/publish/shared'
import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishCornerModal.module.scss'
import { PublishCornerFormState } from '../PublishCornerModal.types'

type ReviewStepProps = {
  t: TFunction
  state: PublishCornerFormState
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ t, state }) => {
  const addressParts = [
    `${state.street} ${state.number}`.trim(),
    state.unit.trim(),
    state.postalCode.trim(),
  ].filter(Boolean)

  const address = addressParts.join(' · ')

  const entries = [
    {
      label: t('publishCorner.review.name'),
      value: state.name,
    },
    {
      label: t('publishCorner.review.scope'),
      value: t(`publishCorner.scope.${state.scope}`),
    },
    {
      label: t('publishCorner.review.host'),
      value: state.hostAlias,
    },
    {
      label: t('publishCorner.review.contact'),
      value: state.internalContact,
    },
    {
      label: t('publishCorner.review.rules'),
      value: state.rules || t('publishCorner.review.emptyField'),
    },
    {
      label: t('publishCorner.review.schedule'),
      value: state.schedule || t('publishCorner.review.emptyField'),
    },
    {
      label: t('publishCorner.review.address'),
      value: address || t('publishCorner.review.emptyField'),
    },
    {
      label: t('publishCorner.review.coordinates'),
      value: `${state.latitude}, ${state.longitude}`,
    },
    {
      label: t('publishCorner.review.visibilityPreference'),
      value: t(
        `publishCorner.visibilityPreference.${state.visibilityPreference}`
      ),
    },
    {
      label: t('publishCorner.review.status'),
      value: t(`publishCorner.status.${state.status}`),
    },
  ]

  return (
    <div className={styles.reviewWrapper}>
      <PublishReviewCard entries={entries}>
        {state.photo ? (
          <div className={styles.photoPreview}>
            <img
              src={state.photo.url}
              alt={t('publishCorner.review.photoAlt')}
            />
          </div>
        ) : null}
      </PublishReviewCard>

      <div className={styles.privacyNotice}>
        {t('publishCorner.review.privacyNotice')}
      </div>
    </div>
  )
}
