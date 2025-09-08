import { Toaster } from '@components/ui/toaster/Toaster'
import { AuthProvider } from '@contexts/auth/AuthContext'
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
          <div>
            <AppRoutes />
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
