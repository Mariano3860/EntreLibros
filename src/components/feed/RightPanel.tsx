import { useTranslation } from 'react-i18next'

import suggestions from '@mocks/data/suggestions.mock'

import styles from './RightPanel.module.scss'

export const RightPanel = () => {
  const { t } = useTranslation()

  return (
    <aside className={styles.panel}>
      <h2>{t('community.feed.suggestions')}</h2>
      <ul>
        {suggestions.map((s) => (
          <li key={s.id}>
            <img src={s.avatar} alt={s.user} />
            <span>{s.user}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
