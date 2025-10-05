import { afterEach, describe, expect, test, vi } from 'vitest'

import { RELATIVE_API_ROUTES } from '@api/routes'
import { searchAddressSuggestions } from '@api/map/geocoding.service'
import { GeocodingSuggestion } from '@api/map/geocoding.types'

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}))

vi.mock('@api/axios', () => ({
  apiClient: {
    get: getMock,
  },
}))

afterEach(() => {
  getMock.mockReset()
})

const buildSuggestion = (): GeocodingSuggestion => ({
  id: 'suggestion-1',
  label: 'Libertad 987, CABA',
  secondaryLabel: 'Buenos Aires, Argentina',
  street: 'Libertad',
  number: '987',
  postalCode: '1001',
  coordinates: { latitude: -34.6037, longitude: -58.3816 },
})

describe('searchAddressSuggestions', () => {
  test('returns an empty array when query is blank', async () => {
    const results = await searchAddressSuggestions('   ')
    expect(results).toEqual([])
    expect(getMock).not.toHaveBeenCalled()
  })

  test('fetches and returns valid suggestions', async () => {
    const suggestion = buildSuggestion()
    getMock.mockResolvedValueOnce({ data: [suggestion] })

    const results = await searchAddressSuggestions('Libertad 987')

    expect(getMock).toHaveBeenCalledWith(RELATIVE_API_ROUTES.MAP.GEOCODE, {
      params: { q: 'Libertad 987' },
    })
    expect(results).toEqual([suggestion])
  })

  test('throws when response is not an array', async () => {
    getMock.mockResolvedValueOnce({ data: { invalid: true } })

    await expect(searchAddressSuggestions('Calle falsa 123')).rejects.toThrow(
      'Invalid geocoding response'
    )
    expect(getMock).toHaveBeenCalledWith(RELATIVE_API_ROUTES.MAP.GEOCODE, {
      params: { q: 'Calle falsa 123' },
    })
  })

  test('throws when a suggestion does not match the contract', async () => {
    const invalidSuggestion = { label: 'Sin coordenadas' }
    getMock.mockResolvedValueOnce({
      data: [invalidSuggestion],
    })

    await expect(
      searchAddressSuggestions('Avenida Siempre Viva 742')
    ).rejects.toThrow('Invalid geocoding suggestion in response')
    expect(getMock).toHaveBeenCalledWith(RELATIVE_API_ROUTES.MAP.GEOCODE, {
      params: { q: 'Avenida Siempre Viva 742' },
    })
  })
})
