import { FeedActions } from '../FeedActions'
import type { StoryItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

export const StoryCard = ({ item }: { item: StoryItem }) => (
  <article className={styles.card}>
    <FeedCardHeader item={item} />
    {item.image ? (
      <img src={item.image} alt="" className={styles.image} />
    ) : null}
    <FeedActions initialLikes={item.likes} />
    <div className={styles.content}>
      <p>{item.body}</p>
      {item.book ? (
        <div className={styles.secondaryButton}>
          📚 {item.book.title} · {item.book.author}
        </div>
      ) : null}
    </div>
  </article>
)
