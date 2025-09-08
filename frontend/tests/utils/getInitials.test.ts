import { getInitials } from '@utils/getInitials'
import { describe, expect, test } from 'vitest'

describe('getInitials', () => {
  test('returns first letter without at sign', () => {
    expect(getInitials('@gabriela')).toBe('G')
    expect(getInitials('juan')).toBe('J')
  })
})
