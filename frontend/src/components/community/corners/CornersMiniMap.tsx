import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useCornersMap } from '@src/hooks/api/useCornersMap'

import styles from './CornersMiniMap.module.scss'

export const CornersMiniMap = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useCornersMap()
  const pins = data?.pins ?? []

  return (
    <section className={styles.card} aria-labelledby="corners-map-title">
      <h3 id="corners-map-title" className={styles.title}>
        {t('community.feed.cornersMap.title')}
      </h3>
      <p className={styles.description}>
        {data?.description ?? t('community.feed.cornersMap.description')}
      </p>
      <div className={styles.mapWrapper}>
        <div className={styles.mapActions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t('community.feed.cornersMap.actions.nearby') ?? ''}
          >
            📍
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t('community.feed.cornersMap.actions.filter') ?? ''}
          >
            🧭
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t('community.feed.cornersMap.actions.expand') ?? ''}
          >
            ⤢
          </button>
        </div>
        <div
          className={classNames(styles.map, { [styles.loading]: isLoading })}
        >
          {isLoading && <span className={styles.loader} aria-hidden />}
          {isError && !isLoading && (
            <span className={styles.status} role="status">
              {t('community.feed.cornersMap.error')}
            </span>
          )}
          {!isLoading &&
            !isError &&
            pins.map((pin) => (
              <span
                key={pin.id}
                className={classNames(styles.pin, {
                  [styles.pinQuiet]: pin.status === 'quiet',
                })}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                •
              </span>
            ))}
        </div>
      </div>
      <p className={styles.footer}>{t('community.feed.cornersMap.footer')}</p>
    </section>
  )
}
