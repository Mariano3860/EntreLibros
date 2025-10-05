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
      label: t('publishCorner.review.location'),
      value: `${state.neighborhood}, ${state.city} · ${state.province}, ${state.country}`,
    },
    {
      label: t('publishCorner.review.reference'),
      value: state.reference,
    },
    {
      label: t('publishCorner.review.visibility'),
      value: t(`publishCorner.visibility.${state.visibility}`),
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
