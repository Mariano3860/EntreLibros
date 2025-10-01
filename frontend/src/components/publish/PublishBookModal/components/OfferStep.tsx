import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishBookModal.module.scss'
import { PublishBookCorner, PublishBookOffer } from '../PublishBookModal.types'

import { CornerPicker } from './CornerPicker'

type OfferStepErrors = Partial<Record<'modes' | 'condition' | 'price', string>>

type OfferStepProps = {
  t: TFunction
  offer: PublishBookOffer
  corner: PublishBookCorner | null
  errors: OfferStepErrors
  genres: readonly PublishBookOffer['tradePreferences'][number][]
  onOfferChange: (update: Partial<PublishBookOffer>) => void
  onDeliveryChange: (update: Partial<PublishBookOffer['delivery']>) => void
  onToggleTradePreference: (
    genre: PublishBookOffer['tradePreferences'][number]
  ) => void
  onCornerChange: (corner: PublishBookCorner | null) => void
  onBlur: React.FocusEventHandler<HTMLElement>
}

export const OfferStep: React.FC<OfferStepProps> = React.memo(
  ({
    t,
    offer,
    corner,
    errors,
    genres,
    onOfferChange,
    onDeliveryChange,
    onToggleTradePreference,
    onCornerChange,
    onBlur,
  }) => (
    <div className={styles.stepLayout}>
      <div className={styles.formGroup}>
        <label>{t('publishBook.offer.modes.label')}</label>
        <div className={styles.checkboxGroup}>
          {(['trade', 'sale', 'donation'] as const).map((mode) => (
            <label key={mode} className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={offer[mode]}
                onChange={(event) =>
                  onOfferChange({ [mode]: event.target.checked })
                }
              />
              <span>{t(`publishBook.offer.modes.${mode}`)}</span>
            </label>
          ))}
        </div>
        {errors.modes && (
          <span className={styles.error} role="alert">
            {errors.modes}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>{t('publishBook.offer.condition.label')}</label>
        <div className={styles.radioGroup}>
          {(['new', 'very_good', 'good', 'acceptable'] as const).map(
            (condition) => (
              <label key={condition} className={styles.radioRow}>
                <input
                  type="radio"
                  name="publish-condition"
                  value={condition}
                  checked={offer.condition === condition}
                  onChange={() => onOfferChange({ condition })}
                />
                <span>
                  {t(`publishBook.offer.condition.options.${condition}`)}
                </span>
              </label>
            )
          )}
        </div>
        {errors.condition && (
          <span className={styles.error} role="alert">
            {errors.condition}
          </span>
        )}
      </div>

      {offer.sale && (
        <div className={styles.priceGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="publish-price">
              {t('publishBook.offer.price.label')}
            </label>
            <input
              id="publish-price"
              className={styles.input}
              inputMode="decimal"
              value={offer.priceAmount}
              onChange={(event) =>
                onOfferChange({ priceAmount: event.target.value })
              }
              onBlur={onBlur}
              aria-invalid={errors.price ? 'true' : 'false'}
            />
            {errors.price && (
              <span className={styles.error} role="alert">
                {errors.price}
              </span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="publish-currency">
              {t('publishBook.offer.price.currency')}
            </label>
            <select
              id="publish-currency"
              className={styles.select}
              value={offer.priceCurrency}
              onChange={(event) =>
                onOfferChange({ priceCurrency: event.target.value })
              }
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      )}

      {offer.trade && (
        <div className={styles.formGroup}>
          <label>{t('publishBook.offer.trade.label')}</label>
          <div className={styles.badgeRow}>
            {genres.map((genre) => {
              const isActive = offer.tradePreferences.includes(genre)
              return (
                <button
                  key={genre}
                  type="button"
                  className={`${styles.badge} ${
                    isActive ? styles.badgeActive : ''
                  }`.trim()}
                  onClick={() => onToggleTradePreference(genre)}
                >
                  {t(`publishBook.offer.trade.genres.${genre}`)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="publish-notes">
          {t('publishBook.offer.notes.label')}
        </label>
        <textarea
          id="publish-notes"
          className={styles.textarea}
          value={offer.notes}
          maxLength={300}
          onChange={(event) => onOfferChange({ notes: event.target.value })}
          onBlur={onBlur}
        />
        <span className={styles.toastInline}>
          {t('publishBook.offer.notes.counter', {
            count: offer.notes.length,
          })}
        </span>
      </div>

      <CornerPicker value={corner} onChange={onCornerChange} onBlur={onBlur} />

      <div className={styles.formGroup}>
        <label>{t('publishBook.offer.availability.label')}</label>
        <div className={styles.radioGroup}>
          {(['public', 'private'] as const).map((mode) => (
            <label key={mode} className={styles.radioRow}>
              <input
                type="radio"
                name="publish-availability"
                value={mode}
                checked={offer.availability === mode}
                onChange={() => onOfferChange({ availability: mode })}
              />
              <span>{t(`publishBook.offer.availability.options.${mode}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t('publishBook.offer.delivery.label')}</label>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={offer.delivery.nearBookCorner}
              onChange={(event) =>
                onDeliveryChange({ nearBookCorner: event.target.checked })
              }
            />
            <span>
              {t('publishBook.offer.delivery.options.nearBookCorner')}
            </span>
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={offer.delivery.inPerson}
              onChange={(event) =>
                onDeliveryChange({ inPerson: event.target.checked })
              }
            />
            <span>{t('publishBook.offer.delivery.options.inPerson')}</span>
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={offer.delivery.shipping}
              onChange={(event) =>
                onDeliveryChange({ shipping: event.target.checked })
              }
            />
            <span>{t('publishBook.offer.delivery.options.shipping')}</span>
          </label>
        </div>
      </div>

      {offer.delivery.shipping && (
        <div className={styles.formGroup}>
          <label htmlFor="publish-shipping-payer">
            {t('publishBook.offer.delivery.shippingPayer.label')}
          </label>
          <select
            id="publish-shipping-payer"
            className={styles.select}
            value={offer.delivery.shippingPayer}
            onChange={(event) =>
              onDeliveryChange({
                shippingPayer: event.target
                  .value as PublishBookOffer['delivery']['shippingPayer'],
              })
            }
            onBlur={onBlur}
          >
            <option value="owner">
              {t('publishBook.offer.delivery.shippingPayer.owner')}
            </option>
            <option value="requester">
              {t('publishBook.offer.delivery.shippingPayer.requester')}
            </option>
            <option value="split">
              {t('publishBook.offer.delivery.shippingPayer.split')}
            </option>
          </select>
        </div>
      )}
    </div>
  )
)

OfferStep.displayName = 'OfferStep'
