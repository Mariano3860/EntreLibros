import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MapCornerPin } from '@src/api/map/map.types'

import styles from './ProposeMeetingModal.module.scss'

type ProposeMeetingModalProps = {
  isOpen: boolean
  onClose: () => void
  availableCorners: MapCornerPin[]
  defaultCornerId?: string
  onSubmit: (payload: { cornerId: string; date: string; time: string }) => void
}

export const ProposeMeetingModal = ({
  isOpen,
  onClose,
  availableCorners,
  defaultCornerId,
  onSubmit,
}: ProposeMeetingModalProps) => {
  const { t } = useTranslation()
  const [cornerId, setCornerId] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const options = useMemo(
    () =>
      availableCorners.map((corner) => ({
        value: corner.id,
        label: `${corner.name} · ${corner.barrio}`,
      })),
    [availableCorners]
  )

  useEffect(() => {
    if (!isOpen) return
    setCornerId(defaultCornerId ?? availableCorners[0]?.id ?? '')
    setDate('')
    setTime('')
  }, [availableCorners, defaultCornerId, isOpen])

  if (!isOpen) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cornerId) return
    onSubmit({ cornerId, date, time })
    onClose()
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="propose-meeting-title"
      >
        <h2 id="propose-meeting-title" className={styles.title}>
          {t('map.cta.proposeMeeting')}
        </h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            {t('map.modal.cornerLabel')}
            <select
              className={styles.select}
              value={cornerId}
              onChange={(event) => setCornerId(event.target.value)}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('map.modal.dateLabel')}
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
          <label>
            {t('map.modal.timeLabel')}
            <input
              type="time"
              className={styles.input}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              {t('map.modal.cancel')}
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!cornerId}
            >
              {t('map.modal.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
