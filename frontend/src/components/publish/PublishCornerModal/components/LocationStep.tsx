import {
  PublishFileUpload,
  PublishSegmentedControl,
  PublishTextField,
} from '@components/publish/shared'
import { TFunction } from 'i18next'
import React, { useCallback, useMemo, useState } from 'react'

import styles from '../PublishCornerModal.module.scss'
import { PublishCornerFormState } from '../PublishCornerModal.types'

type LocationStepErrors = Partial<
  Record<
    'street' | 'number' | 'latitude' | 'longitude' | 'photo' | 'consent',
    string
  >
>

type LocationStepProps = {
  t: TFunction
  state: PublishCornerFormState
  errors: LocationStepErrors
  onChange: (update: Partial<PublishCornerFormState>) => void
  onPhotoSelect: (files: FileList | null) => void
  onRemovePhoto: () => void
}

const visibilityOptions = [
  {
    id: 'exact',
    labelKey: 'publishCorner.visibilityPreference.exact',
  },
  {
    id: 'approximate',
    labelKey: 'publishCorner.visibilityPreference.approximate',
  },
] as const

const statusOptions = [
  { id: 'active', labelKey: 'publishCorner.status.active' },
  { id: 'paused', labelKey: 'publishCorner.status.paused' },
] as const

export const LocationStep: React.FC<LocationStepProps> = ({
  t,
  state,
  errors,
  onChange,
  onPhotoSelect,
  onRemovePhoto,
}) => {
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const coordinatesFilled = useMemo(
    () => Boolean(state.latitude.trim() && state.longitude.trim()),
    [state.latitude, state.longitude]
  )

  const handleUseCurrentLocation = useCallback(() => {
    if (isLocating) return

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError(t('publishCorner.errors.geolocationUnsupported'))
      return
    }

    setIsLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        })
        setIsLocating(false)
      },
      () => {
        setLocationError(t('publishCorner.errors.geolocationDenied'))
        setIsLocating(false)
      }
    )
  }, [isLocating, onChange, t])

  return (
    <div className={styles.stepLayout}>
      <div className={styles.gridTwo}>
        <PublishTextField
          id="corner-street"
          label={t('publishCorner.fields.street')}
          value={state.street}
          onChange={(event) => onChange({ street: event.target.value })}
          error={errors.street}
          required
        />
        <PublishTextField
          id="corner-number"
          label={t('publishCorner.fields.number')}
          value={state.number}
          onChange={(event) => onChange({ number: event.target.value })}
          error={errors.number}
          required
        />
        <PublishTextField
          id="corner-unit"
          label={t('publishCorner.fields.unit')}
          value={state.unit}
          onChange={(event) => onChange({ unit: event.target.value })}
        />
        <PublishTextField
          id="corner-postal-code"
          label={t('publishCorner.fields.postalCode')}
          value={state.postalCode}
          onChange={(event) => onChange({ postalCode: event.target.value })}
        />
      </div>

      <div className={styles.coordinatesSection}>
        <div className={styles.coordinatesHeader}>
          <h4>{t('publishCorner.fields.coordinates')}</h4>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating
              ? t('publishCorner.fields.locating')
              : coordinatesFilled
                ? t('publishCorner.fields.updateLocation')
                : t('publishCorner.fields.useCurrentLocation')}
          </button>
        </div>

        <div className={styles.coordinatesGrid}>
          <PublishTextField
            id="corner-latitude"
            label={t('publishCorner.fields.latitude')}
            type="number"
            inputMode="decimal"
            step="any"
            value={state.latitude}
            onChange={(event) => onChange({ latitude: event.target.value })}
            error={errors.latitude}
            required
          />
          <PublishTextField
            id="corner-longitude"
            label={t('publishCorner.fields.longitude')}
            type="number"
            inputMode="decimal"
            step="any"
            value={state.longitude}
            onChange={(event) => onChange({ longitude: event.target.value })}
            error={errors.longitude}
            required
          />
        </div>

        {locationError ? (
          <p className={styles.error} role="alert">
            {locationError}
          </p>
        ) : null}
      </div>

      <PublishSegmentedControl
        id="corner-visibility"
        label={t('publishCorner.fields.visibilityPreference')}
        value={state.visibilityPreference}
        options={visibilityOptions.map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
        onChange={(value) =>
          onChange({
            visibilityPreference:
              value as PublishCornerFormState['visibilityPreference'],
          })
        }
      />

      <PublishFileUpload
        id="corner-photo"
        label={t('publishCorner.fields.photo')}
        buttonLabel={t('publishCorner.fields.photoCta')}
        hint={t('publishCorner.fields.photoHint') ?? undefined}
        accept="image/*"
        multiple={false}
        previews={state.photo ? [state.photo] : []}
        onFilesSelected={onPhotoSelect}
        onDropFiles={(files) => onPhotoSelect(files)}
        onRemoveFile={() => onRemovePhoto()}
        removeLabel={t('publishCorner.fields.photoRemove') ?? ''}
        error={errors.photo}
      />

      <PublishSegmentedControl
        id="corner-status"
        label={t('publishCorner.fields.status')}
        value={state.status}
        options={statusOptions.map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
        onChange={(value) =>
          onChange({ status: value as PublishCornerFormState['status'] })
        }
      />

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
    </div>
  )
}
