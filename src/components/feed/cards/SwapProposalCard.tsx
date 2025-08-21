import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { SwapProposalItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: SwapProposalItem
}

export const SwapProposalCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const offeredImage = `https://picsum.photos/seed/${item.offered}/600/400`
  const requestedImage = `https://picsum.photos/seed/${item.requested}/600/400`

  const handleAccept = () => {
    track('feed.cta', { type: 'swap', action: 'accept' })
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <img src={item.avatar} alt={item.user} />
        <span>{item.user}</span>
      </header>
      <div className={styles.swapImages}>
        <img src={offeredImage} alt={item.offered} />
        <img src={requestedImage} alt={item.requested} />
      </div>
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <section
          aria-label={t('community.feed.swap.proposalAria', { user: item.user, defaultValue: `Swap proposal by ${item.user}` })}
        >
          <p>
            {t('community.feed.swap.wants', {
              user: item.user,
              offered: item.offered,
              requested: item.requested,
            })}
          </p>
          <dl className={styles.srOnly}>
            <dt>{t('community.feed.swap.user')}</dt>
            <dd>{item.user}</dd>
            <dt>{t('community.feed.swap.offered')}</dt>
            <dd>{item.offered}</dd>
            <dt>{t('community.feed.swap.requested')}</dt>
            <dd>{item.requested}</dd>
          </dl>
        </section>
        <button
          className={styles.primaryButton}
          onClick={handleAccept}
          aria-label={t('community.feed.cta.accept')}
        >
          {t('community.feed.cta.accept')}
        </button>
      </div>
    </article>
  )
}
