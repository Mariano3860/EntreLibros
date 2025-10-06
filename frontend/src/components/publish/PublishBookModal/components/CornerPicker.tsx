import { PublishSelectField } from '@components/publish/shared'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useNearbyCorners } from '@src/hooks/api/useNearbyCorners'

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
  const { data, isLoading, isError } = useNearbyCorners()
  const corners: CornerPickerValue[] = (data ?? []).map((corner) => ({
    id: corner.id,
    name: corner.name,
  }))
  const isDisabled = corners.length === 0 && isLoading

  return (
    <PublishSelectField
      id="publish-corner"
      label={t('publishBook.offer.corner.label')}
      value={value?.id ?? ''}
      onChange={(event) => {
        const next = corners.find((corner) => corner.id === event.target.value)
        onChange(next ? { id: next.id, name: next.name } : null)
      }}
      onBlur={onBlur}
      disabled={isLoading || isDisabled || isError}
      containerClassName={styles.formGroup}
      error={isError ? t('publishBook.offer.corner.error') : undefined}
      hint={
        isError
          ? undefined
          : value
            ? t('publishBook.offer.corner.selected', { name: value.name })
            : t('publishBook.offer.corner.helper')
      }
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
    </PublishSelectField>
  )
}

CornerPicker.displayName = 'CornerPicker'
