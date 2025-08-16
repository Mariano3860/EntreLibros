import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../src/contexts/theme/ThemeContext'
import { AuthProvider } from '../src/contexts/auth/AuthContext'

export const renderWithProviders = (ui: ReactElement) => {
  const queryClient = new QueryClient()
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>{ui}</ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}
