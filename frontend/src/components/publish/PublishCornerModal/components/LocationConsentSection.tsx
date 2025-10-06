import React from 'react'

import styles from '../PublishCornerModal.module.scss'
import type { PublishCornerFormState } from '../PublishCornerModal.types'

import type { LocationStepErrors } from './LocationStep.types'

type LocationConsentSectionProps = {
  t: (key: string) => string
  state: PublishCornerFormState
  errors: LocationStepErrors
  onChange: (update: Partial<PublishCornerFormState>) => void
}

export const LocationConsentSection: React.FC<LocationConsentSectionProps> = ({
  t,
  state,
  errors,
  onChange,
}) => {
  return (
    <>
      <div className={styles.consentRow}>
        <input
          id="corner-consent"
          type="checkbox"
          checked={state.consent}
          onChange={(event) => onChange({ consent: event.target.checked })}
        />
        <label htmlFor="corner-consent">
          {t('publishCorner.fields.consent')}
        </label>
      </div>
      {errors.consent ? (
        <span className={styles.error} role="alert">
          {errors.consent}
        </span>
      ) : null}
    </>
  )
}
