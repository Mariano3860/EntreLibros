import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useNearbyCorners } from '@src/hooks/api/useNearbyCorners'

import styles from './CornersStrip.module.scss'

// Extracts the first number found in the label to show in the compact badge.
// Returns null when no number is present so the badge is not rendered.
const extractBadgeNumber = (label?: string | null): string | null => {
  if (!label) return null
  const match = label.match(/\d+/)
  return match ? match[0] : null
}

export const CornersStrip = () => {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useNearbyCorners()

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    [i18n.language]
  )

  const content = useMemo(() => {
    const cornersList = data ?? []

    if (isLoading) {
      return (
        <div className={styles.cards} aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <p role="status" className={styles.status}>
          {t('community.feed.corners.error')}
        </p>
      )
    }

    if (cornersList.length === 0) {
      return (
        <p role="status" className={styles.status}>
          {t('community.feed.corners.empty')}
        </p>
      )
    }

    return (
      <div className={styles.cards}>
        {cornersList.map((corner) => {
          const badgeNumber = extractBadgeNumber(corner.activityLabel)

          return (
            <article key={corner.id} className={styles.card}>
              <figure className={styles.figure}>
                {/* Wrap avatar to anchor the badge to the same 1:1 box */}
                <div className={styles.avatarWrap}>
                  <img
                    src={corner.imageUrl}
                    alt={corner.name}
                    className={styles.avatar}
                    loading="lazy"
                    decoding="async"
                    width={100}
                    height={100}
                    onError={(event) => {
                      // Fallback image without infinite loop
                      event.currentTarget.onerror = null
                      event.currentTarget.src =
                        'https://picsum.photos/seed/corner-fallback/160/160'
                    }}
                  />
                  {/* Compact badge: only the number, full text in title/aria-label */}
                  {badgeNumber && (
                    <span
                      className={styles.activity}
                      title={corner.activityLabel ?? undefined} // fallback nativo
                      data-title={corner.activityLabel ?? undefined} // tooltip CSS
                      aria-label={corner.activityLabel ?? undefined} // accesible
                      tabIndex={0} // permite focus con teclado/touch
                    >
                      {badgeNumber}
                    </span>
                  )}
                </div>
              </figure>

              <div className={styles.meta}>
                <strong className={styles.name}>{corner.name}</strong>
                <span className={styles.distance}>
                  {t('community.feed.corners.distance', {
                    distance: formatter.format(corner.distanceKm),
                  })}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    )
  }, [data, formatter, isError, isLoading, t])

  return (
    <section className={styles.wrapper} aria-labelledby="corners-strip-title">
      <div className={styles.header}>
        <h2 id="corners-strip-title" className={styles.title}>
          {t('community.feed.corners.title')}
        </h2>
        <button type="button" className={styles.mapLink}>
          {t('community.feed.corners.viewMap')}
        </button>
      </div>
      {content}
    </section>
  )
}
