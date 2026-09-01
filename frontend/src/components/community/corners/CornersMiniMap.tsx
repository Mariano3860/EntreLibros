import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCornersMap } from '@src/hooks/api/useCornersMap'

import styles from './CornersMiniMap.module.scss'

type CornersMiniMapProps = {
  embedded?: boolean
  selectedPinId?: string | null
  onSelectionChange?: (cornerId: string | null) => void
}

export const buildCommunityMapPath = (cornerId?: string | null) => {
  const params = new URLSearchParams({ radius: '5' })
  if (cornerId) params.set('corner', cornerId)
  return `/map?${params.toString()}`
}

export const CornersMiniMap = ({
  embedded = false,
  selectedPinId: controlledSelectedPinId,
  onSelectionChange,
}: CornersMiniMapProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useCornersMap()
  const pins = data?.pins ?? []
  const [uncontrolledSelectedPinId, setUncontrolledSelectedPinId] = useState<
    string | null
  >(null)
  const selectedPinId =
    controlledSelectedPinId === undefined
      ? uncontrolledSelectedPinId
      : controlledSelectedPinId
  const selectedPin = pins.find((pin) => pin.id === selectedPinId)
  const cardClassName = embedded
    ? `${styles.card} ${styles.embedded}`
    : styles.card

  const selectPin = (pinId: string) => {
    if (controlledSelectedPinId === undefined) {
      setUncontrolledSelectedPinId(pinId)
    }
    onSelectionChange?.(pinId)
  }

  return (
    <section
      className={cardClassName}
      aria-label={embedded ? t('community.feed.cornersMap.title') : undefined}
      aria-labelledby={embedded ? undefined : 'corners-map-title'}
    >
      {!embedded ? (
        <>
          <h3 id="corners-map-title" className={styles.title}>
            {t('community.feed.cornersMap.title')}
          </h3>
          <p className={styles.description}>
            {data?.description ?? t('community.feed.cornersMap.description')}
          </p>
        </>
      ) : null}
      <div className={styles.mapWrapper}>
        <div className={styles.mapActions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t('community.feed.cornersMap.actions.expand') ?? ''}
            onClick={() => navigate(buildCommunityMapPath(selectedPin?.id))}
          >
            ↗
          </button>
        </div>
        <div
          className={`${styles.map}${isLoading ? ` ${styles.loading}` : ''}`}
          aria-label={t('community.feed.cornersMap.description')}
          role="group"
        >
          {isLoading && <span className={styles.loader} aria-hidden />}
          {isError && !isLoading && (
            <span className={styles.status} role="status">
              {t('community.feed.cornersMap.error')}
            </span>
          )}
          {!isLoading && !isError && pins.length === 0 ? (
            <span className={styles.status} role="status">
              {t('community.feed.cornersMap.empty')}
            </span>
          ) : null}
          {!isLoading &&
            !isError &&
            pins.map((pin) => {
              const pinClassName = [
                styles.pin,
                pin.status === 'quiet' ? styles.pinQuiet : '',
                selectedPinId === pin.id ? styles.pinSelected : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  type="button"
                  key={pin.id}
                  className={pinClassName}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  aria-label={t('community.feed.cornersMap.actions.select', {
                    defaultValue: 'Ver {{name}} en el mapa',
                    name: pin.name,
                  })}
                  aria-pressed={selectedPinId === pin.id}
                  onClick={() => selectPin(pin.id)}
                >
                  <span aria-hidden="true">•</span>
                </button>
              )
            })}
        </div>
      </div>
      {selectedPin ? (
        <p className={styles.selection} role="status">
          {t('community.feed.cornersMap.selected', {
            defaultValue: 'Rincón seleccionado: {{name}}',
            name: selectedPin.name,
          })}
        </p>
      ) : null}
      <p className={styles.footer}>{t('community.feed.cornersMap.footer')}</p>
    </section>
  )
}
