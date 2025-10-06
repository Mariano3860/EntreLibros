import { PublishTextField } from '@components/publish/shared'
import React from 'react'
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'

import type { GeocodingSuggestion } from '@src/api/map/geocoding.types'
import { cx } from '@src/utils/cx'

import styles from '../PublishCornerModal.module.scss'

import type { LocationStepErrors } from './LocationStep.types'

type LocationSearchSectionProps = {
  t: (key: string) => string
  errors: LocationStepErrors
  searchValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  disabled: boolean
  showSuggestions: boolean
  suggestions: GeocodingSuggestion[]
  suggestionListId: string
  activeSuggestionIndex: number
  onSuggestionMouseDown: (
    event: React.MouseEvent<HTMLButtonElement>,
    suggestion: GeocodingSuggestion
  ) => void
  hasSelection: boolean
  hasNoResults: boolean
  isSearching: boolean
  searchError: string | null
  onChangeAddress: () => void
  mapCenter: [number, number] | null
}

export const LocationSearchSection: React.FC<LocationSearchSectionProps> = ({
  t,
  errors,
  searchValue,
  inputRef,
  onSearchChange,
  onFocus,
  onBlur,
  onKeyDown,
  disabled,
  showSuggestions,
  suggestions,
  suggestionListId,
  activeSuggestionIndex,
  onSuggestionMouseDown,
  hasSelection,
  hasNoResults,
  isSearching,
  searchError,
  onChangeAddress,
  mapCenter,
}) => {
  return (
    <div className={styles.addressSection}>
      <PublishTextField
        ref={inputRef}
        id="corner-address-search"
        label={t('publishCorner.fields.addressSearch')}
        placeholder={t('publishCorner.fields.addressSearchPlaceholder') ?? ''}
        value={searchValue}
        onChange={onSearchChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        error={errors.addressSearch}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={suggestions.length > 0 ? suggestionListId : undefined}
        aria-expanded={showSuggestions && suggestions.length > 0}
        aria-haspopup="listbox"
        aria-activedescendant={
          activeSuggestionIndex >= 0
            ? `${suggestionListId}-${suggestions[activeSuggestionIndex]?.id}`
            : undefined
        }
      />

      {!hasSelection ? (
        <p className={styles.searchHint}>
          {t('publishCorner.fields.addressSearchHint')}
        </p>
      ) : null}

      {showSuggestions && suggestions.length > 0 ? (
        <ul
          id={suggestionListId}
          role="listbox"
          className={styles.suggestionsList}
        >
          {suggestions.map((suggestion, index) => {
            const isActive = index === activeSuggestionIndex
            return (
              <li key={suggestion.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`${suggestionListId}-${suggestion.id}`}
                  aria-selected={isActive}
                  className={cx(
                    styles.suggestionButton,
                    isActive ? styles.suggestionButtonActive : ''
                  )}
                  onMouseDown={(event) =>
                    onSuggestionMouseDown(event, suggestion)
                  }
                >
                  <span className={styles.suggestionPrimary}>
                    {suggestion.label}
                  </span>
                  {suggestion.secondaryLabel ? (
                    <span className={styles.suggestionSecondary}>
                      {suggestion.secondaryLabel}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {isSearching ? (
        <p className={styles.searchStatus} role="status">
          {t('publishCorner.location.searching')}
        </p>
      ) : null}

      {searchError ? (
        <p className={styles.searchStatusError} role="alert">
          {searchError}
        </p>
      ) : null}

      {hasNoResults ? (
        <p className={styles.searchStatus} role="status">
          {t('publishCorner.errors.addressNoResults')}
        </p>
      ) : null}

      {hasSelection ? (
        <div className={styles.mapPreview}>
          <div className={styles.mapPreviewHeader}>
            <span>{t('publishCorner.fields.mapPreviewTitle')}</span>
            <button
              type="button"
              className={styles.changeAddressButton}
              onClick={onChangeAddress}
            >
              {t('publishCorner.actions.changeAddress')}
            </button>
          </div>
          {mapCenter ? (
            <MapContainer
              center={mapCenter}
              zoom={16}
              className={styles.mapPreviewCanvas}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              dragging={false}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <CircleMarker
                center={mapCenter}
                radius={10}
                pathOptions={{
                  color: 'var(--primary-600, #2d57ff)',
                  fillColor: 'var(--primary-600, #2d57ff)',
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              />
            </MapContainer>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
