import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../src/App'

describe('App Component', () => {
  test('renders correctly', () => {
    render(<App />)

    expect(screen.getByText('home.hero_title')).toBeVisible()
  })
})
