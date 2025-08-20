import { getInitials } from '@utils/getInitials'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { CommunityStats } from '@src/api/community/communityStats.types'
import { HOME_URLS } from '@src/constants/constants'

import styles from '../StatsTab.module.scss'

type Props = {
  contributors: CommunityStats['topContributors']
}

export const TopContributorsCard = ({ contributors }: Props) => {
  const { t } = useTranslation()
  return (
    <div className={styles.topContributorsCard}>
      <h3>{t('community.stats.topContributors.title')}</h3>
      <ul aria-label="top-contributors">
        {contributors.map((user) => (
          <li key={user.username}>
            <span
              className={styles.avatar}
              role="img"
              aria-label={user.username}
            >
              {getInitials(user.username)}
            </span>
            <span className={styles.name}>{user.username}</span>
            <span className={styles.metric}>
              {t(`community.stats.topContributors.metric.${user.metric}`, {
                count: user.value,
              })}
            </span>
          </li>
        ))}
      </ul>
      <Link to={`/${HOME_URLS.COMMUNITY}`} className={styles.viewCommunity}>
        {t('community.stats.topContributors.viewCommunity')}
      </Link>
    </div>
  )
}
