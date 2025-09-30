import { fireEvent, render } from '@testing-library/react'
import { useEffect, useRef, useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { useFocusTrap } from '@hooks/useFocusTrap'

const TrapTester = ({
  active,
  onEscape,
  autoFocusOutside = true,
}: {
  active: boolean
  onEscape?: () => void
  autoFocusOutside?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const outsideRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (autoFocusOutside) {
      outsideRef.current?.focus()
    }
  }, [autoFocusOutside])

  useFocusTrap({ containerRef, active, onEscape })

  return (
    <div>
      <button ref={outsideRef}>Outside</button>
      <div ref={containerRef} data-testid="trap">
        <button>First</button>
        <button>Middle</button>
        <button>Last</button>
      </div>
    </div>
  )
}

describe('useFocusTrap', () => {
  test('focuses first element and loops with tab navigation', () => {
    const { getByText, getByTestId } = render(
      <TrapTester active onEscape={vi.fn()} />
    )

    const first = getByText('First') as HTMLButtonElement
    const last = getByText('Last') as HTMLButtonElement
    const trap = getByTestId('trap')

    expect(document.activeElement).toBe(first)

    last.focus()
    fireEvent.keyDown(trap, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    first.focus()
    fireEvent.keyDown(trap, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  test('invokes escape callback when pressing Escape', () => {
    const onEscape = vi.fn()
    const { getByTestId } = render(<TrapTester active onEscape={onEscape} />)

    fireEvent.keyDown(getByTestId('trap'), { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  test('returns focus to previously active element on cleanup', () => {
    const RestoreTest = () => {
      const [active, setActive] = useState(true)
      const containerRef = useRef<HTMLDivElement>(null)
      const outsideRef = useRef<HTMLButtonElement>(null)

      useEffect(() => {
        outsideRef.current?.focus()
      }, [])

      useFocusTrap({ containerRef, active })

      return (
        <div>
          <button ref={outsideRef}>Outside</button>
          {active ? (
            <div ref={containerRef} data-testid="dynamic-trap">
              <button>First</button>
              <button>Last</button>
            </div>
          ) : null}
          <button onClick={() => setActive(false)}>Deactivate</button>
        </div>
      )
    }

    const { getByText } = render(<RestoreTest />)

    expect(document.activeElement).toBe(getByText('First'))
    fireEvent.click(getByText('Deactivate'))
    expect(document.querySelector('[data-testid="dynamic-trap"]')).toBeNull()
    expect(getByText('Outside')).toHaveFocus()
  })

  test('does not override focus when inactive', () => {
    const { getByText } = render(
      <TrapTester active={false} autoFocusOutside onEscape={vi.fn()} />
    )

    expect(document.activeElement).toBe(getByText('Outside'))
  })
})
