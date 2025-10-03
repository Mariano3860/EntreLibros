import { render, fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { Toggle } from '@src/components/ui/toggle/Toggle'
import styles from '@src/components/ui/toggle/Toggle.module.scss'

describe('Toggle', () => {
  test('does not submit the parent form when clicked', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const handleToggle = vi.fn()

    render(
      <form onSubmit={handleSubmit}>
        <Toggle isActive={false} onToggle={handleToggle} ariaLabel="theme" />
      </form>
    )

    fireEvent.click(screen.getByRole('switch'))

    expect(handleToggle).toHaveBeenCalledTimes(1)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  test('applies active styles and aria attributes when enabled', () => {
    const handleToggle = vi.fn()

    render(
      <Toggle
        isActive
        onToggle={handleToggle}
        ariaLabel="notifications"
        className="custom-toggle"
      />
    )

    const toggle = screen.getByRole('switch', { name: /notifications/i })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(toggle).toHaveClass('custom-toggle')
    expect(toggle).toHaveClass(styles.toggle)
    expect(toggle).toHaveClass(styles.active)
  })
})
