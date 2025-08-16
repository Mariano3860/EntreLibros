import { renderHook, act } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import {
  ThemeProvider,
  useTheme as useThemeFromContext,
} from '../src/contexts/theme/ThemeContext'
import { useTheme } from '../src/hooks/theme/useTheme'

describe('useTheme', () => {
  test('returns context when used within ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    })
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
  })

  test('throws error when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
  })

  test('useTheme from context file works', () => {
    const { result } = renderHook(() => useThemeFromContext(), {
      wrapper: ThemeProvider,
    })
    expect(result.current.theme).toBe('light')
  })

  test('useTheme from context throws without provider', () => {
    expect(() => renderHook(() => useThemeFromContext())).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
  })
})
