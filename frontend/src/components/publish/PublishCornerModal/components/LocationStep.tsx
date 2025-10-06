import { PublishSegmentedControl } from '@components/publish/shared'
import React from 'react'

import 'leaflet/dist/leaflet.css'

import styles from '../PublishCornerModal.module.scss'
import type { PublishCornerFormState } from '../PublishCornerModal.types'

import { LocationConsentSection } from './LocationConsentSection'
import { LocationFieldsGroup } from './LocationFieldsGroup'
import { LocationPhotoUpload } from './LocationPhotoUpload'
import { LocationSearchSection } from './LocationSearchSection'
import type { LocationStepProps } from './LocationStep.types'
import { useLocationSearch } from './useLocationSearch'

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
  const {
    inputRef,
    searchValue,
    hasSelection,
    mapCenter,
    showSuggestions,
    suggestions,
    isSearching,
    searchError,
    hasNoResults,
    suggestionListId,
    activeSuggestionIndex,
    handleSearchChange,
    handleSearchKeyDown,
    handleInputFocus,
    handleInputBlur,
    handleSuggestionMouseDown,
    handleChangeAddress,
  } = useLocationSearch({ state, t, onChange })

  return (
    <div className={styles.stepLayout}>
      <LocationSearchSection
        t={t}
        errors={errors}
        searchValue={searchValue}
        inputRef={inputRef}
        onSearchChange={handleSearchChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleSearchKeyDown}
        disabled={hasSelection}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        suggestionListId={suggestionListId}
        activeSuggestionIndex={activeSuggestionIndex}
        onSuggestionMouseDown={handleSuggestionMouseDown}
        hasSelection={hasSelection}
        hasNoResults={hasNoResults}
        isSearching={isSearching}
        searchError={searchError}
        onChangeAddress={handleChangeAddress}
        mapCenter={mapCenter}
      />

      <LocationFieldsGroup
        t={t}
        state={state}
        errors={errors}
        disabled={!hasSelection}
        onChange={onChange}
      />

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

      <LocationPhotoUpload
        t={t}
        state={state}
        errors={errors}
        onPhotoSelect={onPhotoSelect}
        onRemovePhoto={onRemovePhoto}
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

      <LocationConsentSection
        t={t}
        state={state}
        errors={errors}
        onChange={onChange}
      />
    </div>
  )
}
