import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { searchAddressSuggestions } from '@src/api/map/geocoding.service'
import type { GeocodingSuggestion } from '@src/api/map/geocoding.types'

import type { PublishCornerFormState } from '../PublishCornerModal.types'

type UseLocationSearchParams = {
  state: PublishCornerFormState
  t: (key: string) => string
  onChange: (update: Partial<PublishCornerFormState>) => void
}

const SEARCH_DEBOUNCE_MS = 250

export const useLocationSearch = ({
  state,
  t,
  onChange,
}: UseLocationSearchParams) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const blurTimeoutRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)

  const [searchValue, setSearchValue] = useState(state.addressSearch)
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)

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

  return {
    inputRef,
    searchValue,
    setSearchValue,
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
  }
}
