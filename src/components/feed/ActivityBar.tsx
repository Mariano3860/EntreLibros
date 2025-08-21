import { useActivity } from '@src/hooks/api/useActivity'

import styles from './ActivityBar.module.scss'

export const ActivityBar = () => {
  const { data } = useActivity()
  const items = data ?? []
  return (
    <div className={styles.bar}>
      {items.map((a) => (
        <div key={a.id} className={styles.item}>
          <img src={a.avatar} alt={a.user} />
          <span>{a.user}</span>
        </div>
      ))}
    </div>
  )
}
