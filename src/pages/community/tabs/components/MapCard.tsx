import { useTranslation } from 'react-i18next'

import type { CommunityStats } from '@src/api/community/communityStats.types'

import styles from '../StatsTab.module.scss'

type Props = {
  pins: CommunityStats['activeHousesMap']
}

export const MapCard = ({ pins }: Props) => {
  const { t } = useTranslation()
  return (
    <div className={styles.mapCard}>
      <h3>{t('community.stats.map.title')}</h3>
      <div className={styles.mapPlaceholder}>
        {pins.map((pin) => (
          <span
            key={`${pin.top}-${pin.left}`}
            className={styles.pin}
            style={{ top: pin.top, left: pin.left }}
          />
        ))}
      </div>
      <p>{t('community.stats.map.description')}</p>
    </div>
  )
}
