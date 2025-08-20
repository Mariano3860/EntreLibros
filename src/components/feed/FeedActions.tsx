import { ReactComponent as CommentIcon } from '@assets/icons/comment.svg'
import { ReactComponent as HeartIcon } from '@assets/icons/heart.svg'
import { ReactComponent as ShareIcon } from '@assets/icons/share.svg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './FeedActions.module.scss'

interface Props {
  initialLikes?: number
}

export const FeedActions = ({ initialLikes = 0 }: Props) => {
  const { t } = useTranslation()
  const [likes, setLikes] = useState(initialLikes)

  return (
    <div className={styles.actions}>
      <button
        aria-label={t('community.feed.actions.like')}
        onClick={() => setLikes((l) => l + 1)}
      >
        <HeartIcon />
      </button>
      <button aria-label={t('community.feed.actions.comment')}>
        <CommentIcon />
      </button>
      <button aria-label={t('community.feed.actions.share')}>
        <ShareIcon />
      </button>
      <span className={styles.likes}>{likes}</span>
    </div>
  )
}
