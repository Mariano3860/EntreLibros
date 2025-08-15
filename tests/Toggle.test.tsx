import { render, fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { Toggle } from '../src/components/ui/toggle/Toggle'

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
})
