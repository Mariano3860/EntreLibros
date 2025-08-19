import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

vi.mock('../../../src/components/register/RegisterForm', () => ({
  RegisterForm: ({ onSubmit }: { onSubmit?: (data: unknown) => void }) => {
    onSubmit?.({})
    return <div>Mocked RegisterForm</div>
  },
}))

import RegisterPage from '../../../src/pages/register/RegisterPage'
import { renderWithProviders } from '../../test-utils'

describe('RegisterPage', () => {
  test('renders register form', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByText('Mocked RegisterForm')).toBeVisible()
  })
})
