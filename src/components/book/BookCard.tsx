import { BookCardProps } from '@components/book/BookCard.types'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './BookCard.module.scss'

export const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  coverUrl,
  condition,
  status,
  isForSale,
  price,
  isForTrade,
  tradePreferences,
  isSeeking,
}) => {
  const { t } = useTranslation()

  const renderTradePreferences = () => {
    if (!tradePreferences || tradePreferences.length === 0) return null
    const shown = tradePreferences.slice(0, 3).join(', ')
    const extra = tradePreferences.length > 3 ? ` +${tradePreferences.length - 3}` : ''
    return `${shown}${extra}`
  }

  return (
    <div className={styles.card}>
      <img
        src={coverUrl}
        alt={t('booksPage.cover_alt', { title })}
        className={styles.cover}
      />
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>{author}</p>
        {status && (
          <span className={`${styles.status} ${styles[status]}`}>
            {t(`booksPage.status.${status}`)}
          </span>
        )}
        {condition && <span className={styles.condition}>{condition}</span>}
        <div className={styles.pills}>
          {isForSale && (
            <span className={styles.sale}>
              {t('booksPage.badge.for_sale', { price })}
            </span>
          )}
          {isForTrade && (
            <span className={styles.trade}>
              {t('booksPage.badge.for_trade')}
              {tradePreferences && tradePreferences.length > 0 && (
                <>
                  {' · '}
                  {renderTradePreferences()}
                </>
              )}
            </span>
          )}
          {isSeeking && <span className={styles.seeking}>{t('booksPage.badge.seeking')}</span>}
        </div>
      </div>
    </div>
  )
}
