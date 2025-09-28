import { RefObject, useEffect } from 'react'

const focusableSelectors =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

type UseFocusTrapOptions = {
  containerRef: RefObject<HTMLElement>
  active: boolean
  onEscape?: () => void
}

export const useFocusTrap = ({
  containerRef,
  active,
  onEscape,
}: UseFocusTrapOptions) => {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((element) => !element.hasAttribute('data-focus-guard'))

    focusable[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onEscape?.()
        return
      }

      if (event.key !== 'Tab' || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [active, containerRef, onEscape])
}
