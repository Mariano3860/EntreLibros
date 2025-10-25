import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { SwapProposalItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

interface Props {
  item: SwapProposalItem
}

export const SwapProposalCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const offeredImage =
    item.offered.cover ??
    `https://picsum.photos/seed/${item.offered.id}/600/400`
  const requestedImage =
    item.requested.cover ??
    `https://picsum.photos/seed/${item.requested.id}/600/400`

  const handleAccept = () => {
    track('feed.cta', { type: 'swap', action: 'accept' })
  }

  return (
    <article className={styles.card}>
      <FeedCardHeader item={item} />
      <div className={styles.swapImages}>
        <img src={offeredImage} alt={item.offered.title} />
        <img src={requestedImage} alt={item.requested.title} />
      </div>
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <section
          aria-label={t('community.feed.swap.proposalAria', {
            user: item.requester.displayName,
          })}
        >
          <p>
            {t('community.feed.swap.wants', {
              requester: item.requester.displayName,
              offeredTitle: item.offered.title,
              requestedTitle: item.requested.title,
              requestedOwner: item.requested.owner.displayName,
            })}
          </p>
          <dl className={styles.srOnly}>
            <dt>{t('community.feed.swap.requester')}</dt>
            <dd>{item.requester.displayName}</dd>
            <dt>{t('community.feed.swap.offered')}</dt>
            <dd>
              {item.offered.title}
              {item.offered.author ? ` — ${item.offered.author}` : ''}
            </dd>
            <dt>{t('community.feed.swap.requested')}</dt>
            <dd>
              {item.requested.title}
              {item.requested.author ? ` — ${item.requested.author}` : ''}
            </dd>
            <dt>{t('community.feed.swap.requestedOwner')}</dt>
            <dd>{item.requested.owner.displayName}</dd>
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
