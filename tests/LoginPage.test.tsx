import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import LoginPage from '../src/pages/login/LoginPage'

import { renderWithProviders } from './test-utils'

describe('LoginPage', () => {
  test('renders login form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('welcome')).toBeVisible()
  })
})
