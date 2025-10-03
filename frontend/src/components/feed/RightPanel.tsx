import { CornersMiniMap } from '@components/community/corners/CornersMiniMap'
import { useTranslation } from 'react-i18next'

import { useSuggestions } from '@src/hooks/api/useSuggestions'

import styles from './RightPanel.module.scss'

export const RightPanel = () => {
  const { t } = useTranslation()
  const { data } = useSuggestions()
  const suggestions = data ?? []

  return (
    <aside className={styles.panel}>
      <CornersMiniMap />
      <section
        className={styles.card}
        aria-labelledby="community-suggestions-title"
      >
        <h2 id="community-suggestions-title">
          {t('community.feed.suggestions')}
        </h2>
        <ul>
          {suggestions.map((s) => (
            <li key={s.id}>
              <img src={s.avatar} alt={s.user} />
              <span>{s.user}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
