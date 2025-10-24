import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { SidebarLoginButton } from '@src/components/sidebar/buttons/SidebarLoginButton'

import { renderWithProviders } from '../../test-utils'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@src/hooks/api/useLogout', () => ({
  useLogout: () => ({ mutate: mockLogout }),
}))

describe('SidebarLoginButton', () => {
  test('renders logout button when user is logged in', () => {
    const { queryClient, rerender } = renderWithProviders(
      <SidebarLoginButton />
    )
    queryClient.setQueryData(['auth'], { user: 'test-user' })

    rerender(<SidebarLoginButton />)

    expect(screen.getByLabelText('Logout')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  test('calls logout when logout button is clicked', () => {
    const { queryClient, rerender } = renderWithProviders(
      <SidebarLoginButton />
    )
    queryClient.setQueryData(['auth'], { user: 'test-user' })

    rerender(<SidebarLoginButton />)

    const logoutButton = screen.getByLabelText('Logout')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  test('renders login button when user is not logged in', () => {
    renderWithProviders(<SidebarLoginButton />)

    expect(screen.getByLabelText('Login')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  test('navigates to login page when login button is clicked', () => {
    renderWithProviders(<SidebarLoginButton />)

    const loginButton = screen.getByLabelText('Login')
    fireEvent.click(loginButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
