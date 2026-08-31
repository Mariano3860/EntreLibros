import { BookCard } from '@components/book/BookCard'
import { PublishReviewCard } from '@components/publish/shared'
import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishBookModal.module.scss'
import { PublishBookFormState } from '../PublishBookModal.types'

type ReviewStepProps = {
  t: TFunction
  metadata: PublishBookFormState['metadata']
  offer: PublishBookFormState['offer']
  coverUrl: string
  acceptedTerms: boolean
  onAcceptedTermsChange: (checked: boolean) => void
}

export const ReviewStep: React.FC<ReviewStepProps> = React.memo(
  ({ t, metadata, offer, coverUrl, acceptedTerms, onAcceptedTermsChange }) => (
    <div className={styles.reviewLayout}>
      <PublishReviewCard
        title={t('publishBook.review.previewTitle')}
        className={styles.reviewCard}
      >
        <div className={styles.reviewIntro}>
          <span className={styles.reviewEyebrow}>
            {t('publishBook.review.previewEyebrow')}
          </span>
          <p>{t('publishBook.review.previewDescription')}</p>
        </div>
        <div className={styles.reviewBookStage}>
          <BookCard
            variant="review"
            title={metadata.title}
            author={metadata.author}
            coverUrl={coverUrl}
            condition={t(`publishBook.preview.condition.${offer.condition}`)}
            status="available"
            isForSale={offer.sale}
            price={offer.sale ? Number(offer.priceAmount) : undefined}
            isForTrade={offer.trade}
            tradePreferences={offer.tradePreferences.map((genre) =>
              t(`publishBook.offer.trade.genres.${genre}`)
            )}
            isSeeking={false}
          />
        </div>
      </PublishReviewCard>

      <div className={styles.checklist}>
        <label className={styles.checklistItem}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => onAcceptedTermsChange(event.target.checked)}
          />
          <span>{t('publishBook.review.terms')}</span>
        </label>
        <p className={styles.toastInline}>{t('publishBook.review.hint')}</p>
      </div>
    </div>
  )
)

ReviewStep.displayName = 'ReviewStep'
