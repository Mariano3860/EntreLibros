import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import { LocationSearchSection } from '@components/publish/PublishCornerModal/components/LocationSearchSection'
import type { GeocodingSuggestion } from '@src/api/map/geocoding.types'

const { MapContainerMock, TileLayerMock, CircleMarkerMock } = vi.hoisted(
  () => ({
    MapContainerMock: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayerMock: () => <div data-testid="tile-layer" />,
    CircleMarkerMock: () => <div data-testid="circle-marker" />,
  })
)

vi.mock('react-leaflet', () => ({
  MapContainer: MapContainerMock,
  TileLayer: TileLayerMock,
  CircleMarker: CircleMarkerMock,
}))

const t = (key: string) => key

type LocationSearchSectionProps = React.ComponentProps<
  typeof LocationSearchSection
>

type SetupOptions = Partial<LocationSearchSectionProps>

const suggestions: GeocodingSuggestion[] = [
  {
    id: '1',
    label: 'Libertad 100',
    street: 'Libertad',
    number: '100',
    secondaryLabel: 'Recoleta',
    coordinates: { latitude: -34.6, longitude: -58.4 },
  },
  {
    id: '2',
    label: 'Libertad 200',
    street: 'Libertad',
    number: '200',
    coordinates: { latitude: -34.61, longitude: -58.41 },
  },
]

const setup = (options: SetupOptions = {}) => {
  const onSuggestionMouseDown =
    vi.fn<LocationSearchSectionProps['onSuggestionMouseDown']>()
  const onChangeAddress = vi.fn<LocationSearchSectionProps['onChangeAddress']>()

  const props: LocationSearchSectionProps = {
    t,
    errors: {},
    searchValue: '',
    inputRef: React.createRef<HTMLInputElement>(),
    onSearchChange: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    onKeyDown: vi.fn(),
    disabled: false,
    showSuggestions: false,
    suggestions: [],
    suggestionListId: 'test-suggestions',
    activeSuggestionIndex: -1,
    onSuggestionMouseDown,
    hasSelection: false,
    hasNoResults: false,
    isSearching: false,
    searchError: null,
    onChangeAddress,
    mapCenter: null,
    ...options,
  }

  const utils = render(<LocationSearchSection {...props} />)

  return {
    ...utils,
    props,
    onSuggestionMouseDown,
    onChangeAddress,
  }
}

describe('LocationSearchSection', () => {
  test('renders suggestions list and handles selection callbacks', () => {
    const { onSuggestionMouseDown } = setup({
      searchValue: 'Liber',
      showSuggestions: true,
      suggestions,
      activeSuggestionIndex: 0,
    })

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    fireEvent.mouseDown(options[1])
    expect(onSuggestionMouseDown).toHaveBeenCalled()
    const [event, suggestion] = onSuggestionMouseDown.mock.calls[0]
    expect(event?.type).toBe('mousedown')
    expect(suggestion).toEqual(suggestions[1])
  })

  test('shows search statuses and error messages', () => {
    const { rerender, props } = setup({
      searchValue: 'Libertad',
      showSuggestions: true,
      suggestions: [],
      isSearching: true,
    })

    expect(
      screen.getByText('publishCorner.location.searching')
    ).toBeInTheDocument()

    rerender(
      <LocationSearchSection
        {...props}
        isSearching={false}
        searchError="Network error"
      />
    )
    expect(screen.getByText('Network error')).toBeInTheDocument()

    rerender(
      <LocationSearchSection
        {...props}
        isSearching={false}
        showSuggestions
        suggestions={[]}
        hasNoResults
        searchError={null}
      />
    )
    expect(
      screen.getByText('publishCorner.errors.addressNoResults')
    ).toBeInTheDocument()
  })

  test('renders map preview when a selection exists', () => {
    const { rerender, props, onChangeAddress } = setup({
      hasSelection: true,
      mapCenter: null,
    })

    const changeButton = screen.getByRole('button', {
      name: 'publishCorner.actions.changeAddress',
    })
    fireEvent.click(changeButton)
    expect(onChangeAddress).toHaveBeenCalled()
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()

    rerender(
      <LocationSearchSection
        {...props}
        hasSelection
        mapCenter={[-34.6, -58.4]}
        onChangeAddress={onChangeAddress}
      />
    )

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('circle-marker')).toBeInTheDocument()
  })
})
