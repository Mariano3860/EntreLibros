import AppRoutes from './routes'
import React from 'react'
import { ThemeProvider } from '@contexts/ThemeContext'
import '@styles/main.scss'

const App = () => {
  return (
    <ThemeProvider>
      <div>
        <AppRoutes />
      </div>
    </ThemeProvider>
  )
}

export default App
