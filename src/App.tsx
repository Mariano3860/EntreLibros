import AppRoutes from './routes'
import React from 'react'
import { ThemeProvider } from '@contexts/ThemeContext'
import '@styles/main.scss'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@components/ui/toaster/Toaster'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div>
          <AppRoutes />
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
