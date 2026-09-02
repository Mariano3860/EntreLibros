import { useTranslation } from 'react-i18next'

import type { CommunityCornerDetail } from '@src/api/community/corners.types'
import { Panel, PrototypeButton } from '@src/features/prototype/PrototypeUI'

import styles from './CornerDetailsPanel.module.scss'

type CornerDetailsPanelProps = {
  detail: CommunityCornerDetail | null
  isLoading?: boolean
  isError?: boolean
  isUpdating?: boolean
  error?: string
  onRetry?: () => void
  onEdit?: () => void
  onToggleStatus?: () => void
}

export const CornerDetailsPanel = ({
  detail,
  isLoading = false,
  isError = false,
  isUpdating = false,
  error,
  onRetry,
  onEdit,
  onToggleStatus,
}: CornerDetailsPanelProps) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Panel
        className={styles.panel}
        as="aside"
        aria-label={t('map.cornerDetail.title')}
      >
        <p className={styles.feedback}>{t('map.cornerDetail.loading')}</p>
      </Panel>
    )
  }

  if (isError || !detail) {
    return (
      <Panel
        className={styles.panel}
        as="aside"
        aria-label={t('map.cornerDetail.title')}
      >
        <p className={styles.feedback}>{t('map.cornerDetail.error')}</p>
        {onRetry ? (
          <PrototypeButton size="small" onClick={onRetry}>
            {t('map.cornerDetail.retry')}
          </PrototypeButton>
        ) : null}
      </Panel>
    )
  }

  const isActive = detail.status === 'active'

  return (
    <Panel
      className={styles.panel}
      as="aside"
      aria-label={t('map.cornerDetail.title')}
    >
      <div className={styles.imageFrame}>
        {detail.imageUrl ? (
          <img src={detail.imageUrl} alt="" className={styles.image} />
        ) : (
          <span aria-hidden="true">⌂</span>
        )}
      </div>

      <div className={styles.heading}>
        <span className={isActive ? styles.active : styles.paused}>
          {isActive
            ? t('map.cornerDetail.status.active')
            : t('map.cornerDetail.status.paused')}
        </span>
        <h2>{detail.name}</h2>
        <p>{detail.hostAlias}</p>
      </div>

      <dl className={styles.dataList}>
        <div>
          <dt>{t('map.cornerDetail.location')}</dt>
          <dd>
            {detail.location.neighborhood} · {detail.location.city}
          </dd>
          <small>{detail.location.referencePointLabel}</small>
        </div>
        <div>
          <dt>{t('map.cornerDetail.schedule')}</dt>
          <dd>{detail.schedule ?? t('map.cornerDetail.notProvided')}</dd>
        </div>
        <div>
          <dt>{t('map.cornerDetail.rules')}</dt>
          <dd>{detail.rules ?? t('map.cornerDetail.notProvided')}</dd>
        </div>
        <div>
          <dt>{t('map.cornerDetail.activity')}</dt>
          <dd>
            {detail.activity.weeklyExchanges} · {t('map.cornerDetail.weekly')}
          </dd>
          <small>
            {detail.activity.totalExchanges} {t('map.cornerDetail.total')}
          </small>
        </div>
      </dl>

      {detail.isOwner ? (
        <div className={styles.ownerActions}>
          <span className={styles.ownerLabel}>
            {t('map.cornerDetail.owner')}
          </span>
          <PrototypeButton
            size="small"
            onClick={onEdit}
            disabled={isUpdating}
            data-testid="corner-edit-button"
          >
            {t('map.cornerDetail.edit')}
          </PrototypeButton>
          <label className={styles.statusToggle}>
            <span>
              {isActive
                ? t('map.cornerDetail.pause')
                : t('map.cornerDetail.reactivate')}
            </span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={onToggleStatus}
              disabled={isUpdating}
              aria-label={
                isActive
                  ? t('map.cornerDetail.pause')
                  : t('map.cornerDetail.reactivate')
              }
            />
          </label>
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </Panel>
  )
}
