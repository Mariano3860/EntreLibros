import { useTranslation } from 'react-i18next'

import { RescheduleMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleActionButton, BubbleBase } from './BubbleBase'
import styles from './BubbleContent.module.scss'

export type BubbleRescheduleProps = {
  message: RescheduleMessage
  timeLabel: string
}

export const BubbleReschedule = ({
  message,
  timeLabel,
}: BubbleRescheduleProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="warning"
      header={t('community.messages.chat.labels.reschedule')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.reschedule')}
    >
      <p className={styles.note}>{message.reschedule.note}</p>
      <span className={styles.sectionTitle}>
        {t('community.messages.chat.reschedule.previous')}
      </span>
      <AgreementDetailsSummary details={message.reschedule.previous} />
      <hr className={styles.divider} />
      <span className={styles.sectionTitle}>
        {t('community.messages.chat.reschedule.proposed')}
      </span>
      <ul className={styles.list}>
        <li className={styles.item}>
          <span className={styles.label}>
            {t('community.messages.chat.fields.schedule')}
          </span>
          <span className={styles.value}>
            {message.reschedule.proposed.schedule.day}
            <span
              className={styles.muted}
            >{` · ${message.reschedule.proposed.schedule.time}`}</span>
          </span>
        </li>
        {message.reschedule.proposed.location ? (
          <li className={styles.item}>
            <span className={styles.label}>
              {t('community.messages.chat.fields.place')}
            </span>
            <span className={styles.value}>
              {message.reschedule.proposed.location.name}
              <span
                className={styles.muted}
              >{` — ${message.reschedule.proposed.location.area}`}</span>
            </span>
          </li>
        ) : null}
      </ul>
      <BubbleActionButton variant="primary">
        {t('community.messages.chat.actions.accept')}
      </BubbleActionButton>
      <BubbleActionButton>
        {t('community.messages.chat.actions.suggestAnother')}
      </BubbleActionButton>
    </BubbleBase>
  )
}
