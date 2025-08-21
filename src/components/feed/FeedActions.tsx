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
  const [liked, setLiked] = useState(false)

  const handleLikeClick = () => {
    if (liked) {
      setLikes((l) => l - 1)
      setLiked(false)
    } else {
      setLikes((l) => l + 1)
      setLiked(true)
    }
  }

  return (
    <div className={styles.actions}>
      <div className={styles.buttons}>
        <button
          aria-label={t('community.feed.actions.like')}
          onClick={handleLikeClick}
          className={liked ? styles.liked : undefined}
        >
          <HeartIcon />
        </button>
        <button aria-label={t('community.feed.actions.comment')}>
          <CommentIcon />
        </button>
        <button aria-label={t('community.feed.actions.share')}>
          <ShareIcon />
        </button>
      </div>
      <span className={styles.likes}>
        {likes} {t('community.feed.actions.likes')}
      </span>
    </div>
  )
}
