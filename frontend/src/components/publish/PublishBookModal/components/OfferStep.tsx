import {
  PublishSelectField,
  PublishTextField,
  PublishTextareaField,
} from '@components/publish/shared'
import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishBookModal.module.scss'
import { PublishBookOffer } from '../PublishBookModal.types'

type OfferStepErrors = Partial<Record<'modes' | 'condition' | 'price', string>>

type OfferStepProps = {
  t: TFunction
  offer: PublishBookOffer
  errors: OfferStepErrors
  genres: readonly PublishBookOffer['tradePreferences'][number][]
  onOfferChange: (update: Partial<PublishBookOffer>) => void
  onDeliveryChange: (update: Partial<PublishBookOffer['delivery']>) => void
  onToggleTradePreference: (
    genre: PublishBookOffer['tradePreferences'][number]
  ) => void
  onBlur: React.FocusEventHandler<HTMLElement>
}

export const OfferStep: React.FC<OfferStepProps> = React.memo(
  ({
    t,
    offer,
    errors,
    genres,
    onOfferChange,
    onDeliveryChange,
    onToggleTradePreference,
    onBlur,
  }) => {
    const [genreQuery, setGenreQuery] = React.useState('')
    const normalizedQuery = genreQuery.trim().toLocaleLowerCase()
    const visibleGenres = genres.filter((genre) =>
      t(`publishBook.offer.trade.genres.${genre}`)
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    )

    return (
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
            <PublishTextField
              id="publish-price"
              label={t('publishBook.offer.price.label')}
              value={offer.priceAmount}
              inputMode="decimal"
              onChange={(event) =>
                onOfferChange({ priceAmount: event.target.value })
              }
              onBlur={onBlur}
              error={errors.price}
              containerClassName={styles.formGroup}
            />
            <PublishSelectField
              id="publish-currency"
              label={t('publishBook.offer.price.currency')}
              value={offer.priceCurrency}
              onChange={(event) =>
                onOfferChange({ priceCurrency: event.target.value })
              }
              containerClassName={styles.formGroup}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </PublishSelectField>
          </div>
        )}

        {offer.trade && (
          <div className={styles.tradePreferences}>
            <div className={styles.tradeHeader}>
              <label htmlFor="publish-trade-search">
                {t('publishBook.offer.trade.label')}
              </label>
              {offer.tradePreferences.length > 0 && (
                <span className={styles.tradeCount}>
                  {offer.tradePreferences.length}{' '}
                  {t('publishBook.offer.trade.selectedCount')}
                </span>
              )}
            </div>

            {offer.tradePreferences.length > 0 && (
              <div
                className={styles.selectedTags}
                aria-label={t('publishBook.offer.trade.selectedLabel')}
              >
                {offer.tradePreferences.map((genre) => {
                  const label = t(`publishBook.offer.trade.genres.${genre}`)
                  return (
                    <button
                      key={genre}
                      type="button"
                      className={styles.selectedTag}
                      aria-label={`${t('publishBook.offer.trade.remove')} ${label}`}
                      onClick={() => onToggleTradePreference(genre)}
                    >
                      {label}
                      <span aria-hidden="true">x</span>
                    </button>
                  )
                })}
              </div>
            )}

            <input
              id="publish-trade-search"
              className={styles.tradeSearch}
              type="search"
              value={genreQuery}
              onChange={(event) => setGenreQuery(event.target.value)}
              placeholder={t('publishBook.offer.trade.searchPlaceholder')}
              aria-label={t('publishBook.offer.trade.searchLabel')}
            />

            <div className={styles.badgeRow}>
              {visibleGenres.map((genre) => {
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
              {visibleGenres.length === 0 && (
                <p className={styles.tradeEmpty}>
                  {t('publishBook.offer.trade.empty')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <PublishTextareaField
            id="publish-notes"
            label={t('publishBook.offer.notes.label')}
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
                <span>
                  {t(`publishBook.offer.availability.options.${mode}`)}
                </span>
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
          <PublishSelectField
            id="publish-shipping-payer"
            label={t('publishBook.offer.delivery.shippingPayer.label')}
            value={offer.delivery.shippingPayer}
            onChange={(event) =>
              onDeliveryChange({
                shippingPayer: event.target
                  .value as PublishBookOffer['delivery']['shippingPayer'],
              })
            }
            onBlur={onBlur}
            containerClassName={styles.formGroup}
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
          </PublishSelectField>
        )}
      </div>
    )
  }
)

OfferStep.displayName = 'OfferStep'
