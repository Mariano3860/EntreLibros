import { Toaster } from '@components/ui/toaster/Toaster'
import { AuthProvider } from '@contexts/auth/AuthContext'
import { BookDetailModalProvider } from '@contexts/book'
import { ThemeProvider } from '@contexts/theme/ThemeContext'
import { useUserLanguage } from '@hooks/language/useUserLanguage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import AppRoutes from './routes'

import '@src/shared/styles/_reset.scss'
import '@src/shared/styles/main.scss'

const queryClient = new QueryClient()

const LanguageInitializer = () => {
  useUserLanguage()
  return null
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageInitializer />
          <BookDetailModalProvider>
            <div>
              <AppRoutes />
              <Toaster />
            </div>
          </BookDetailModalProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
