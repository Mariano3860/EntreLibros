import { act, render } from '@testing-library/react'
import React, { useImperativeHandle, useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { useLocationSearch } from '@components/publish/PublishCornerModal/components/useLocationSearch'
import { initialState } from '@components/publish/PublishCornerModal/PublishCornerModal.constants'
import type { PublishCornerFormState } from '@components/publish/PublishCornerModal/PublishCornerModal.types'

vi.mock('leaflet/dist/leaflet.css', () => ({}))

const { searchMock } = vi.hoisted(() => ({
  searchMock: vi.fn<
    (term: string) => Promise<
      Array<{
        id: string
        label: string
        street: string
        number: string
        postalCode?: string
        secondaryLabel?: string
        coordinates: { latitude: number; longitude: number }
      }>
    >
  >(),
}))

vi.mock('@src/api/map/geocoding.service', () => ({
  searchAddressSuggestions: searchMock,
}))

type ImperativeApi = ReturnType<typeof useLocationSearch> & {
  state: PublishCornerFormState
}

const t = (key: string) => key

type TestComponentProps = {
  initial?: Partial<PublishCornerFormState>
}

const TestComponent = React.forwardRef<ImperativeApi, TestComponentProps>(
  ({ initial }, ref) => {
    const [state, setState] = useState<PublishCornerFormState>({
      ...initialState,
      ...initial,
    })

    const search = useLocationSearch({
      state,
      t,
      onChange: (update) => setState((prev) => ({ ...prev, ...update })),
    })

    useImperativeHandle(ref, () => ({ ...search, state }))
    return null
  }
)

describe('useLocationSearch', () => {
  test('handles suggestion flow and selection', async () => {
    vi.useFakeTimers()
    searchMock.mockResolvedValue([
      {
        id: '1',
        label: 'Libertad 100',
        street: 'Libertad',
        number: '100',
        coordinates: { latitude: -34.6, longitude: -58.4 },
      },
      {
        id: '2',
        label: 'Libertad 200',
        street: 'Libertad',
        number: '200',
        coordinates: { latitude: -34.61, longitude: -58.41 },
      },
    ])

    const ref = React.createRef<ImperativeApi>()
    render(<TestComponent ref={ref} />)

    const changeEvent = {
      target: { value: 'Libertad' },
    } as React.ChangeEvent<HTMLInputElement>

    act(() => {
      ref.current?.handleSearchChange(changeEvent)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(ref.current?.suggestions).toHaveLength(2)

    act(() => {
      ref.current?.handleSearchKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
      ref.current?.handleSearchKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(ref.current?.state.street).toBe('Libertad')
    expect(ref.current?.state.latitude).toBe('-34.6')
    expect(ref.current?.suggestions).toHaveLength(0)

    vi.useRealTimers()
  })

  test('exposes errors when the search request fails', async () => {
    vi.useFakeTimers()
    searchMock.mockRejectedValue(new Error('network'))

    const ref = React.createRef<ImperativeApi>()
    render(<TestComponent ref={ref} />)

    act(() => {
      ref.current?.handleSearchChange({
        target: { value: 'Sinclair' },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(ref.current?.searchError).toBe(
      'publishCorner.errors.addressSearchFailed'
    )
    expect(ref.current?.suggestions).toHaveLength(0)

    vi.useRealTimers()
  })

  test('resets selection through handleChangeAddress', async () => {
    const ref = React.createRef<ImperativeApi>()
    render(
      <TestComponent
        ref={ref}
        initial={{
          addressSearch: 'Libertad 100',
          street: 'Libertad',
          number: '100',
          latitude: '-34.6',
          longitude: '-58.4',
        }}
      />
    )

    act(() => {
      ref.current?.handleChangeAddress()
    })

    expect(ref.current?.state.addressSearch).toBe('')
    expect(ref.current?.state.street).toBe('')
    expect(ref.current?.state.latitude).toBe('')
    expect(ref.current?.hasSelection).toBe(false)
  })

  test('handles focus, keyboard navigation and suggestion mouse interactions', async () => {
    vi.useFakeTimers()
    searchMock.mockResolvedValue([
      {
        id: '1',
        label: 'Libertad 100',
        street: 'Libertad',
        number: '100',
        coordinates: { latitude: -34.6, longitude: -58.4 },
      },
      {
        id: '2',
        label: 'Libertad 200',
        street: 'Libertad',
        number: '200',
        coordinates: { latitude: -34.61, longitude: -58.41 },
      },
    ])

    const ref = React.createRef<ImperativeApi>()
    render(<TestComponent ref={ref} />)

    act(() => {
      ref.current?.handleSearchChange({
        target: { value: 'Lib' },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(ref.current?.suggestions).toHaveLength(2)
    expect(ref.current?.showSuggestions).toBe(true)
    expect(ref.current?.activeSuggestionIndex).toBe(0)

    act(() => {
      ref.current?.handleSearchKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(ref.current?.activeSuggestionIndex).toBe(1)

    act(() => {
      ref.current?.handleSearchKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(ref.current?.showSuggestions).toBe(false)

    act(() => {
      ref.current?.handleInputFocus()
      ref.current?.handleInputBlur()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })

    expect(ref.current?.showSuggestions).toBe(false)

    const preventDefault = vi.fn()

    act(() => {
      ref.current?.handleInputFocus()
      ref.current?.handleSuggestionMouseDown(
        { preventDefault } as unknown as React.MouseEvent<HTMLButtonElement>,
        {
          id: '2',
          label: 'Libertad 200',
          street: 'Libertad',
          number: '200',
          coordinates: { latitude: -34.61, longitude: -58.41 },
        }
      )
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(ref.current?.state.addressSearch).toBe('Libertad 200')
    expect(ref.current?.state.latitude).toBe('-34.61')

    vi.useRealTimers()
  })
})
