import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

vi.mock('../../../src/components/login/LoginForm', () => ({
  LoginForm: ({ onSubmit }: { onSubmit?: (data: unknown) => void }) => {
    onSubmit?.({})
    return <div>Mocked LoginForm</div>
  },
}))

import LoginPage from '../../../src/pages/login/LoginPage'
import { renderWithProviders } from '../../test-utils'

describe('LoginPage', () => {
  test('renders login form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Mocked LoginForm')).toBeVisible()
  })
})
