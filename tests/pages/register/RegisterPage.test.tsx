import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

vi.mock('../../../src/components/register/RegisterForm', () => ({
  RegisterForm: ({ onSubmit }: { onSubmit?: () => void }) => (
    <button onClick={onSubmit}>Mocked RegisterForm</button>
  ),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})

import { useNavigate } from 'react-router-dom'

import RegisterPage from '../../../src/pages/register/RegisterPage'
import { renderWithProviders } from '../../test-utils'

describe('RegisterPage', () => {
  test('navigates to login on submit', () => {
    const navigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigate)

    renderWithProviders(<RegisterPage />)
    fireEvent.click(screen.getByText('Mocked RegisterForm'))
    expect(navigate).toHaveBeenCalledWith('/login')
  })
})
