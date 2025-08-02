import { ThemeContext } from '@contexts/theme/ThemeContext'
import { ThemeContextType } from '@contexts/theme/ThemeContext.types'
import { useContext } from 'react'

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
