import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { EventStatus } from '@src/api/events/events.types'

import styles from './EventsEmptyState.module.scss'

interface Props {
  status: EventStatus | 'all'
}

export const EventsEmptyState = ({ status }: Props) => {
  const { t } = useTranslation()

  return (
    <div className={styles.empty}>
      <p>{t(`community.events.empty.${status}`)}</p>
      <Link to="/community" className={styles.exploreButton}>
        {t('community.events.explore')}
      </Link>
    </div>
  )
}
