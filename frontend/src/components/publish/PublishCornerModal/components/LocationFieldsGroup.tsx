import { PublishTextField } from '@components/publish/shared'
import React from 'react'

import styles from '../PublishCornerModal.module.scss'
import type { PublishCornerFormState } from '../PublishCornerModal.types'

import type { LocationStepErrors } from './LocationStep.types'

type LocationFieldsGroupProps = {
  t: (key: string) => string
  state: PublishCornerFormState
  errors: LocationStepErrors
  disabled: boolean
  onChange: (update: Partial<PublishCornerFormState>) => void
}

export const LocationFieldsGroup: React.FC<LocationFieldsGroupProps> = ({
  t,
  state,
  errors,
  disabled,
  onChange,
}) => {
  return (
    <div className={styles.gridTwo}>
      <PublishTextField
        id="corner-street"
        label={t('publishCorner.fields.street')}
        value={state.street}
        onChange={(event) => onChange({ street: event.target.value })}
        error={disabled ? undefined : errors.street}
        required
        disabled={disabled}
      />
      <PublishTextField
        id="corner-number"
        label={t('publishCorner.fields.number')}
        value={state.number}
        onChange={(event) => onChange({ number: event.target.value })}
        error={disabled ? undefined : errors.number}
        required
        disabled={disabled}
      />
      <PublishTextField
        id="corner-unit"
        label={t('publishCorner.fields.unit')}
        value={state.unit}
        onChange={(event) => onChange({ unit: event.target.value })}
        disabled={disabled}
      />
      <PublishTextField
        id="corner-postal-code"
        label={t('publishCorner.fields.postalCode')}
        value={state.postalCode}
        onChange={(event) => onChange({ postalCode: event.target.value })}
        disabled={disabled}
      />
    </div>
  )
}
