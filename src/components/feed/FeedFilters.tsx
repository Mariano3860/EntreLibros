import { useTranslation } from 'react-i18next'

import styles from './FeedFilters.module.scss'

interface Props {
  filter: string
  onFilterChange: (filter: string) => void
  onSearchChange: (q: string) => void
}

export const FeedFilters = ({
  filter,
  onFilterChange,
  onSearchChange,
}: Props) => {
  const { t } = useTranslation()

  const tabs = [
    'all',
    'book',
    'swap',
    'sale',
    'seeking',
    'review',
    'event',
    'house',
    'person',
  ] as const

  return (
    <div className={styles.wrapper}>
      <input
        aria-label={t('community.feed.search')}
        placeholder={t('community.feed.search') ?? ''}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className={styles.tabs}>
        {tabs.map((tName) => (
          <button
            key={tName}
            onClick={() => onFilterChange(tName)}
            className={filter === tName ? styles.active : ''}
            aria-label={t(`community.feed.tabs.${tName}`)}
          >
            {t(`community.feed.tabs.${tName}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
