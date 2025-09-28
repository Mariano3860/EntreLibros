import { useTranslation } from 'react-i18next'

import { AgreementDetails } from '../Messages.types'

import styles from './BubbleContent.module.scss'

type AgreementDetailsProps = {
  details: AgreementDetails
}

export const AgreementDetailsSummary = ({ details }: AgreementDetailsProps) => {
  const { t } = useTranslation()

  const placeLabel =
    details.location.type === 'bookCorner'
      ? t('community.messages.chat.location.bookCorner')
      : t('community.messages.chat.location.publicSpace')

  return (
    <div className={styles.agreementDetails}>
      <ul className={styles.list}>
        <li className={styles.item}>
          <span className={styles.label}>
            {t('community.messages.chat.fields.place')}
          </span>
          <span className={styles.value}>
            {details.location.name}
            <span
              className={styles.muted}
            >{` — ${details.location.area}`}</span>
            <span className={styles.badge}>{placeLabel}</span>
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            {t('community.messages.chat.fields.schedule')}
          </span>
          <span className={styles.value}>
            {details.schedule.day}
            <span
              className={styles.muted}
            >{` · ${details.schedule.time}`}</span>
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            {t('community.messages.chat.fields.book')}
          </span>
          <span className={styles.value}>{details.book.title}</span>
        </li>
      </ul>
    </div>
  )
}
