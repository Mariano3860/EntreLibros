import { Toaster } from '@components/ui/toaster/Toaster'
import { AuthProvider } from '@contexts/auth/AuthContext'
import { ThemeProvider } from '@contexts/theme/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import AppRoutes from './routes'

import '@/shared/styles/main.scss'

const queryClient = new QueryClient()

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <div>
            <AppRoutes />
            <Toaster />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
