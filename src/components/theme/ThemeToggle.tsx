import { useTheme } from '@hooks/theme/useTheme'
import { Toggle } from '../ui/toggle/Toggle'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Toggle
      isActive={theme === 'dark'}
      onToggle={toggleTheme}
      ariaLabel="Toggle theme"
    />
  )
}
