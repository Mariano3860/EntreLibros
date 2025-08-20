import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { SwapProposalItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: SwapProposalItem
}

export const SwapProposalCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleAccept = () => {
    track('feed.cta', { type: 'swap', action: 'accept' })
  }

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{item.requester}</h3>
      <p>
        {item.requester} {t('community.feed.swap.wants', { offered: item.offered, requested: item.requested })}
      </p>
      <div className={styles.actions}>
        <button onClick={handleAccept} aria-label={t('community.feed.cta.accept')}>
          {t('community.feed.cta.accept')}
        </button>
      </div>
    </article>
  )
}
