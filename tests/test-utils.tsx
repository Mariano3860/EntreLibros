import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { AuthProvider } from '@src/contexts/auth/AuthContext'
import { ThemeProvider } from '@src/contexts/theme/ThemeContext'

export const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )

  return { Wrapper, queryClient }
}

export const renderWithProviders = (ui: ReactElement) => {
  const { Wrapper, queryClient } = createWrapper()
  return { queryClient, ...render(ui, { wrapper: Wrapper }) }
}
