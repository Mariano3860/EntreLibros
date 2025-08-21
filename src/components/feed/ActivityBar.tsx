import activityData from '@mocks/data/activity.mock'

import styles from './ActivityBar.module.scss'

export const ActivityBar = () => {
  return (
    <div className={styles.bar}>
      {activityData.map((a) => (
        <div key={a.id} className={styles.item}>
          <img src={a.avatar} alt={a.user} />
          <span>{a.user}</span>
        </div>
      ))}
    </div>
  )
}
