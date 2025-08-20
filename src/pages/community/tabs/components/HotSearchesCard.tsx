import { useTranslation } from 'react-i18next'

import type { CommunityStats } from '@src/api/community/communityStats.types'

import styles from '../StatsTab.module.scss'

type Props = {
  searches: CommunityStats['hotSearches']
}

export const HotSearchesCard = ({ searches }: Props) => {
  const { t } = useTranslation()
  return (
    <div className={styles.hotSearchesCard}>
      <h3>{t('community.stats.hotSearches.title')}</h3>
      <div className={styles.chips}>
        {searches.map((item) => (
          <span key={item.term} className={styles.chip}>
            {item.term} ({item.count})
          </span>
        ))}
      </div>
    </div>
  )
}
