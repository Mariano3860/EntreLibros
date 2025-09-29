import { MutableRefObject, RefObject, useEffect, useRef } from 'react'

const focusableSelectors =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

type FocusTrapRef<TElement extends HTMLElement> =
  | RefObject<TElement | null>
  | MutableRefObject<TElement | null>

type UseFocusTrapOptions<TElement extends HTMLElement = HTMLElement> = {
  containerRef: FocusTrapRef<TElement>
  active: boolean
  onEscape?: () => void
}

export const useFocusTrap = <TElement extends HTMLElement = HTMLElement>({
  containerRef,
  active,
  onEscape,
}: UseFocusTrapOptions<TElement>) => {
  const escapeRef = useRef(onEscape)
  const lastActiveElementRef = useRef<HTMLElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    escapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const focusableRef: { current: HTMLElement[] } = { current: [] }

    const updateFocusable = () => {
      focusableRef.current = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((element) => !element.hasAttribute('data-focus-guard'))
    }

    updateFocusable()

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (container.contains(target)) {
        lastActiveElementRef.current = target
      }
      updateFocusable()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = focusableRef.current
      if (focusable.length === 0) return

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

    const currentActive = document.activeElement as HTMLElement | null
    previouslyFocusedRef.current = currentActive

    if (currentActive && container.contains(currentActive)) {
      lastActiveElementRef.current = currentActive
    } else {
      const focusable = focusableRef.current
      const target =
        (lastActiveElementRef.current &&
        container.contains(lastActiveElementRef.current)
          ? lastActiveElementRef.current
          : focusable[0]) ?? null
      target?.focus()
      lastActiveElementRef.current = target
    }

    let observer: MutationObserver | null = null
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => updateFocusable())
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['tabindex', 'disabled', 'data-focus-guard'],
      })
    }

    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('focusin', handleFocusIn)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('focusin', handleFocusIn)
      observer?.disconnect()
      if (
        previouslyFocusedRef.current &&
        previouslyFocusedRef.current !== document.activeElement
      ) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [active, containerRef])
}
