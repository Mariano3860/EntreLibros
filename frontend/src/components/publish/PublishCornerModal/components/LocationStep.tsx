import {
  PublishFileUpload,
  PublishSegmentedControl,
  PublishSelectField,
  PublishTextField,
} from '@components/publish/shared'
import { TFunction } from 'i18next'
import React, { useMemo } from 'react'

import styles from '../PublishCornerModal.module.scss'
import { PublishCornerFormState } from '../PublishCornerModal.types'

type LocationStepErrors = Partial<
  Record<
    | 'country'
    | 'province'
    | 'city'
    | 'neighborhood'
    | 'reference'
    | 'photo'
    | 'consent',
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

const countries = ['Argentina', 'Uruguay'] as const

const provinces: Record<(typeof countries)[number], string[]> = {
  Argentina: ['Buenos Aires', 'Córdoba', 'Santa Fe'],
  Uruguay: ['Montevideo', 'Canelones'],
}

const cities: Record<string, string[]> = {
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca'],
  Córdoba: ['Córdoba Capital', 'Villa María'],
  'Santa Fe': ['Rosario', 'Santa Fe'],
  Montevideo: ['Montevideo'],
  Canelones: ['Las Piedras', 'Ciudad de la Costa'],
}

const neighborhoods: Record<string, string[]> = {
  'La Plata': ['Centro', 'Tolosa', 'Gonnet'],
  'Mar del Plata': ['Los Troncos', 'La Perla'],
  'Bahía Blanca': ['Centro', 'Villa Mitre'],
  'Córdoba Capital': ['Nueva Córdoba', 'Güemes'],
  'Villa María': ['Centro', 'Barrio General Paz'],
  Rosario: ['Pichincha', 'República de la Sexta'],
  'Santa Fe': ['Candioti', 'Constituyentes'],
  Montevideo: ['Ciudad Vieja', 'Pocitos'],
  'Las Piedras': ['Centro', 'Obelisco'],
  'Ciudad de la Costa': ['Solymar', 'Lagomar'],
}

const visibilityOptions = [
  { id: 'neighborhood', labelKey: 'publishCorner.visibility.neighborhood' },
  { id: 'city', labelKey: 'publishCorner.visibility.city' },
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
  const availableProvinces = useMemo(
    () => provinces[state.country as keyof typeof provinces] ?? [],
    [state.country]
  )

  const availableCities = useMemo(
    () => cities[state.province] ?? [],
    [state.province]
  )

  const availableNeighborhoods = useMemo(
    () => neighborhoods[state.city] ?? [],
    [state.city]
  )

  return (
    <div className={styles.stepLayout}>
      <div className={styles.gridTwo}>
        <PublishSelectField
          id="corner-country"
          label={t('publishCorner.fields.country')}
          value={state.country}
          onChange={(event) =>
            onChange({
              country: event.target.value,
              province: '',
              city: '',
              neighborhood: '',
            })
          }
          error={errors.country}
          required
        >
          <option value="">{t('publishCorner.placeholders.country')}</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </PublishSelectField>

        <PublishSelectField
          id="corner-province"
          label={t('publishCorner.fields.province')}
          value={state.province}
          onChange={(event) =>
            onChange({
              province: event.target.value,
              city: '',
              neighborhood: '',
            })
          }
          disabled={!state.country}
          error={errors.province}
          required
        >
          <option value="">{t('publishCorner.placeholders.province')}</option>
          {availableProvinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </PublishSelectField>

        <PublishSelectField
          id="corner-city"
          label={t('publishCorner.fields.city')}
          value={state.city}
          onChange={(event) =>
            onChange({ city: event.target.value, neighborhood: '' })
          }
          disabled={!state.province}
          error={errors.city}
          required
        >
          <option value="">{t('publishCorner.placeholders.city')}</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </PublishSelectField>

        <PublishSelectField
          id="corner-neighborhood"
          label={t('publishCorner.fields.neighborhood')}
          value={state.neighborhood}
          onChange={(event) => onChange({ neighborhood: event.target.value })}
          disabled={!state.city}
          error={errors.neighborhood}
          required
        >
          <option value="">
            {t('publishCorner.placeholders.neighborhood')}
          </option>
          {availableNeighborhoods.map((neighborhood) => (
            <option key={neighborhood} value={neighborhood}>
              {neighborhood}
            </option>
          ))}
        </PublishSelectField>
      </div>

      <PublishTextField
        id="corner-reference"
        label={t('publishCorner.fields.reference')}
        value={state.reference}
        onChange={(event) => onChange({ reference: event.target.value })}
        error={errors.reference}
        hint={t('publishCorner.fields.referenceHint') ?? undefined}
        required
      />

      <PublishSegmentedControl
        id="corner-visibility"
        label={t('publishCorner.fields.visibility')}
        value={state.visibility}
        options={visibilityOptions.map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
        onChange={(value) =>
          onChange({
            visibility: value as PublishCornerFormState['visibility'],
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
