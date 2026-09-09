import type { CommunityCornerDetail } from '@api/community/corners.types'
import type { MapPin } from '@api/map/map.types'
import { CornerDetailsPanel } from '@components/map/CornerDetailsPanel/CornerDetailsPanel'
import { useTranslation } from 'react-i18next'

import {
  Panel,
  ActionButton,
} from '@src/components/ui/presentation/Presentation'

import styles from './MapSelectionCard.module.scss'

type MapSelectionCardProps = {
  pin: MapPin | null
  cornerDetail: CommunityCornerDetail | null
  cornerDetailsOpen: boolean
  isLoading?: boolean
  isError?: boolean
  isUpdating?: boolean
  error?: string
  onClose: () => void
  onOpenDetails: () => void
  onOpenPublication: () => void
  onRetry?: () => void
  onEdit?: () => void
  onToggleStatus?: () => void
  onReport?: () => void
}

const formatDistance = (distanceKm: number | null, unavailable: string) =>
  distanceKm === null ? unavailable : `${distanceKm.toLocaleString('es-AR')} km`

export const MapSelectionCard = ({
  pin,
  cornerDetail,
  cornerDetailsOpen,
  isLoading = false,
  isError = false,
  isUpdating = false,
  error,
  onClose,
  onOpenDetails,
  onOpenPublication,
  onRetry,
  onEdit,
  onToggleStatus,
  onReport,
}: MapSelectionCardProps) => {
  const { t } = useTranslation()

  if (!pin) return null

  const corner = pin.type === 'corner' ? pin.data : null
  const publication = pin.type === 'publication' ? pin.data : null
  const imageUrl = publication?.photo ?? corner?.photos[0]
  const title = publication?.title ?? corner?.name ?? ''
  const subtitle = publication
    ? publication.authors.join(', ') || t('map.selection.unknownAuthor')
    : `${corner?.barrio ?? ''} · ${corner?.city ?? ''}`
  const status = publication
    ? t('map.selection.publicationStatus')
    : corner?.isOpenNow === false
      ? t('map.selection.closed')
      : t('map.selection.open')
  const meta = publication
    ? formatDistance(
        publication.distanceKm,
        t('map.selection.distanceUnavailable')
      )
    : corner
      ? formatDistance(
          corner.distanceKm,
          t('map.selection.distanceUnavailable')
        )
      : ''
  const activity = corner?.lastSignalAt
    ? t('map.selection.recentActivity')
    : t('map.selection.noActivity')

  return (
    <Panel className={styles.card} as="article" aria-label={title}>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label={t('map.selection.close')}
      >
        ×
      </button>
      <div className={styles.imageFrame}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.image} />
        ) : (
          <span aria-hidden="true">✦</span>
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.status}>{status}</span>
        <h2>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.meta}>
          <span>{meta}</span>
          {corner ? <span>{activity}</span> : null}
        </div>
        <div className={styles.actions}>
          <ActionButton
            tone="primary"
            size="small"
            onClick={publication ? onOpenPublication : onOpenDetails}
          >
            {publication
              ? t('map.cta.openPublication')
              : cornerDetailsOpen
                ? t('map.selection.hideDetails')
                : t('map.cta.openCorner')}
          </ActionButton>
        </div>
      </div>
      {corner && cornerDetailsOpen ? (
        <div className={styles.detail}>
          <CornerDetailsPanel
            detail={cornerDetail}
            isLoading={isLoading}
            isError={isError}
            isUpdating={isUpdating}
            error={error}
            onRetry={onRetry}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onReport={onReport}
            embedded
            as="div"
          />
        </div>
      ) : null}
    </Panel>
  )
}

export type { MapSelectionCardProps }
