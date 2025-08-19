import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Logo } from '@src/assets'

describe('assets index', () => {
  test('exports Logo component', () => {
    const { container } = render(<Logo />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
