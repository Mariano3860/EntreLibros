import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchNearbyCorners } from '@src/api/community/corners.service'

import styles from '../PublishBookModal.module.scss'

export type CornerPickerValue = {
  id: string
  name: string
}

type CornerPickerProps = {
  value: CornerPickerValue | null
  onChange: (value: CornerPickerValue | null) => void
  onBlur: React.FocusEventHandler<HTMLElement>
}

export const CornerPicker: React.FC<CornerPickerProps> = ({
  value,
  onChange,
  onBlur,
}) => {
  const { t } = useTranslation()
  const [{ corners, status }, setState] = useState<{
    corners: CornerPickerValue[]
    status: 'idle' | 'loading' | 'success' | 'error'
  }>({ corners: [], status: 'idle' })

  useEffect(() => {
    let cancelled = false

    const loadCorners = async () => {
      setState((prev) => ({ ...prev, status: 'loading' }))
      try {
        const response = await fetchNearbyCorners()
        if (cancelled) return
        const mapped = response.map((corner) => ({
          id: corner.id,
          name: corner.name,
        }))
        setState({ corners: mapped, status: 'success' })
      } catch {
        if (cancelled) return
        setState((prev) => ({ ...prev, status: 'error' }))
      }
    }

    void loadCorners()

    return () => {
      cancelled = true
    }
  }, [])

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isDisabled = corners.length === 0 && isLoading

  return (
    <div className={styles.formGroup}>
      <label htmlFor="publish-corner">
        {t('publishBook.offer.corner.label')}
      </label>
      <select
        id="publish-corner"
        className={styles.select}
        value={value?.id ?? ''}
        onChange={(event) => {
          const next = corners.find(
            (corner) => corner.id === event.target.value
          )
          onChange(next ? { id: next.id, name: next.name } : null)
        }}
        onBlur={onBlur}
        disabled={isLoading || isDisabled || isError}
      >
        <option value="">
          {isLoading
            ? t('publishBook.offer.corner.loading')
            : t('publishBook.offer.corner.placeholder')}
        </option>
        {corners.map((corner) => (
          <option key={corner.id} value={corner.id}>
            {corner.name}
          </option>
        ))}
      </select>
      {isError ? (
        <span className={styles.error} role="alert">
          {t('publishBook.offer.corner.error')}
        </span>
      ) : (
        <span className={styles.helperText}>
          {value
            ? t('publishBook.offer.corner.selected', { name: value.name })
            : t('publishBook.offer.corner.helper')}
        </span>
      )}
    </div>
  )
}

CornerPicker.displayName = 'CornerPicker'
