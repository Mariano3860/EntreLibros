import { describe, expect, test } from 'vitest'

import { cx } from '@src/utils/cx'

describe('cx utility', () => {
  test('combines string and number values while ignoring falsy entries', () => {
    expect(cx('btn', '', 'primary', 0, 2)).toBe('btn primary 2')
  })

  test('flattens nested arrays of class values', () => {
    expect(cx(['grid', ['md:grid-cols-2', ['lg:grid-cols-3']]])).toBe(
      'grid md:grid-cols-2 lg:grid-cols-3'
    )
  })

  test('includes object keys with truthy values only', () => {
    expect(
      cx({ active: true, disabled: false, hidden: 0 }, { focused: 1 })
    ).toBe('active focused')
  })
})
