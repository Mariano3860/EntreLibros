import { render } from '@testing-library/react'
import { describe, test } from 'vitest'
import App from '../src/App'

describe('App Component', () => {
  test('renders correctly', () => {
    render(<App />)
  })
})
