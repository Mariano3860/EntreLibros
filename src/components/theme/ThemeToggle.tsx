import { useTheme } from '@hooks/use-theme'
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
