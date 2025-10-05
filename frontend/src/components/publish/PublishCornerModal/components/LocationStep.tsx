import {
  PublishFileUpload,
  PublishSegmentedControl,
  PublishTextField,
} from '@components/publish/shared'
import { TFunction } from 'i18next'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'

import { searchAddressSuggestions } from '@src/api/map/geocoding.service'
import { GeocodingSuggestion } from '@src/api/map/geocoding.types'
import { cx } from '@src/utils/cx'

import 'leaflet/dist/leaflet.css'

import styles from '../PublishCornerModal.module.scss'
import { PublishCornerFormState } from '../PublishCornerModal.types'

type LocationStepErrors = Partial<
  Record<'addressSearch' | 'street' | 'number' | 'photo' | 'consent', string>
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

const SEARCH_DEBOUNCE_MS = 250

export const LocationStep: React.FC<LocationStepProps> = ({
  t,
  state,
  errors,
  onChange,
  onPhotoSelect,
  onRemovePhoto,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState(state.addressSearch)
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const requestIdRef = useRef(0)
  const blurTimeoutRef = useRef<number | null>(null)

  const hasSelection = useMemo(
    () => Boolean(state.latitude.trim() && state.longitude.trim()),
    [state.latitude, state.longitude]
  )
  const hasSearchValue = searchValue.trim().length > 0
  const mapCenter = useMemo(() => {
    if (!hasSelection) return null
    return [Number(state.latitude), Number(state.longitude)] as [number, number]
  }, [hasSelection, state.latitude, state.longitude])

  useEffect(() => {
    if (!hasSelection) return
    setSuggestions([])
    setIsSearching(false)
    setSearchError(null)
    setShowSuggestions(false)
    setSearchValue(state.addressSearch)
  }, [hasSelection, state.addressSearch])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (hasSelection) return

    if (!hasSearchValue) {
      setSuggestions([])
      setIsSearching(false)
      setSearchError(null)
      setActiveSuggestionIndex(-1)
      return
    }

    const timeout = window.setTimeout(async () => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      setIsSearching(true)

      try {
        const results = await searchAddressSuggestions(searchValue)
        if (requestIdRef.current !== requestId) return
        setSuggestions(results)
        setSearchError(null)
        setActiveSuggestionIndex(results.length > 0 ? 0 : -1)
      } catch {
        if (requestIdRef.current !== requestId) return
        setSuggestions([])
        setSearchError(t('publishCorner.errors.addressSearchFailed'))
        setActiveSuggestionIndex(-1)
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSearching(false)
        }
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [hasSearchValue, hasSelection, searchValue, t])

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSearchValue(value)
      setShowSuggestions(true)
      setSearchError(null)
      setActiveSuggestionIndex(-1)
      onChange({
        addressSearch: value,
        latitude: '',
        longitude: '',
      })
    },
    [onChange]
  )

  const handleSelectSuggestion = useCallback(
    (suggestion: GeocodingSuggestion) => {
      onChange({
        addressSearch: suggestion.label,
        street: suggestion.street,
        number: suggestion.number,
        postalCode: suggestion.postalCode ?? '',
        latitude: suggestion.coordinates.latitude.toString(),
        longitude: suggestion.coordinates.longitude.toString(),
      })
      setSearchValue(suggestion.label)
      setSuggestions([])
      setShowSuggestions(false)
      setSearchError(null)
      setActiveSuggestionIndex(-1)
    },
    [onChange]
  )

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveSuggestionIndex((prev) =>
          prev + 1 >= suggestions.length ? 0 : prev + 1
        )
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveSuggestionIndex((prev) =>
          prev - 1 < 0 ? suggestions.length - 1 : prev - 1
        )
        return
      }

      if (event.key === 'Enter') {
        if (activeSuggestionIndex < 0) return
        event.preventDefault()
        handleSelectSuggestion(suggestions[activeSuggestionIndex])
        return
      }

      if (event.key === 'Escape') {
        setShowSuggestions(false)
      }
    },
    [
      activeSuggestionIndex,
      handleSelectSuggestion,
      showSuggestions,
      suggestions,
    ]
  )

  const handleInputFocus = useCallback(() => {
    if (!hasSelection && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [hasSelection, suggestions.length])

  const handleInputBlur = useCallback(() => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false)
    }, 150)
  }, [])

  const handleSuggestionMouseDown = useCallback(
    (
      event: React.MouseEvent<HTMLButtonElement>,
      suggestion: GeocodingSuggestion
    ) => {
      event.preventDefault()
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }
      handleSelectSuggestion(suggestion)
    },
    [handleSelectSuggestion]
  )

  const handleChangeAddress = useCallback(() => {
    setSearchValue('')
    setSuggestions([])
    setSearchError(null)
    setShowSuggestions(false)
    setActiveSuggestionIndex(-1)
    onChange({
      addressSearch: '',
      street: '',
      number: '',
      unit: '',
      postalCode: '',
      latitude: '',
      longitude: '',
    })
    window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }, [onChange])

  const hasNoResults =
    !isSearching &&
    !searchError &&
    showSuggestions &&
    hasSearchValue &&
    suggestions.length === 0

  const suggestionListId = 'publish-corner-address-suggestions'

  return (
    <div className={styles.stepLayout}>
      <div className={styles.addressSection}>
        <PublishTextField
          ref={inputRef}
          id="corner-address-search"
          label={t('publishCorner.fields.addressSearch')}
          placeholder={t('publishCorner.fields.addressSearchPlaceholder') ?? ''}
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleSearchKeyDown}
          disabled={hasSelection}
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
                      handleSuggestionMouseDown(event, suggestion)
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
                onClick={handleChangeAddress}
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

      <div className={styles.gridTwo}>
        <PublishTextField
          id="corner-street"
          label={t('publishCorner.fields.street')}
          value={state.street}
          onChange={(event) => onChange({ street: event.target.value })}
          error={hasSelection ? errors.street : undefined}
          required
          disabled={!hasSelection}
        />
        <PublishTextField
          id="corner-number"
          label={t('publishCorner.fields.number')}
          value={state.number}
          onChange={(event) => onChange({ number: event.target.value })}
          error={hasSelection ? errors.number : undefined}
          required
          disabled={!hasSelection}
        />
        <PublishTextField
          id="corner-unit"
          label={t('publishCorner.fields.unit')}
          value={state.unit}
          onChange={(event) => onChange({ unit: event.target.value })}
          disabled={!hasSelection}
        />
        <PublishTextField
          id="corner-postal-code"
          label={t('publishCorner.fields.postalCode')}
          value={state.postalCode}
          onChange={(event) => onChange({ postalCode: event.target.value })}
          disabled={!hasSelection}
        />
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
