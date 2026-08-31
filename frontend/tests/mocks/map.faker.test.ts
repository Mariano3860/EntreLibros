import { describe, expect, test } from 'vitest'

import { generateMapResponse } from '@mocks/handlers/map/fakers/map.faker'

describe('map fixture', () => {
  test('returns a stable response for visual and integration tests', () => {
    const response = generateMapResponse()

    expect(response.meta.generatedAt).toBe('2025-01-15T12:00:00.000Z')
    expect(response.corners).toHaveLength(5)
    expect(response.publications).toHaveLength(10)
    expect(response.activity).toHaveLength(6)
    expect(generateMapResponse()).toBe(response)
  })
})
