import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { AuthProvider } from '@src/contexts/auth/AuthContext'
import { BookDetailModalProvider } from '@src/contexts/book'
import { ThemeProvider } from '@src/contexts/theme/ThemeContext'

type WrapperOptions = {
  initialEntries?: string[]
}

export const createWrapper = (options?: WrapperOptions) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={options?.initialEntries}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BookDetailModalProvider>{children}</BookDetailModalProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )

  return { Wrapper, queryClient }
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: WrapperOptions
) => {
  const { Wrapper, queryClient } = createWrapper(options)
  return { queryClient, ...render(ui, { wrapper: Wrapper }) }
}
