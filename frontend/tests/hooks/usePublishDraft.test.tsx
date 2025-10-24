import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { usePublishDraft } from '@src/hooks/usePublishDraft'

describe('usePublishDraft', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  test('initializes with null when no draft exists', () => {
    const { result } = renderHook(() =>
      usePublishDraft({ storageKey: 'test-key' })
    )

    expect(result.current.draft).toBeNull()
  })

  test('loads existing draft from localStorage', () => {
    const existingDraft = { title: 'Test', updatedAt: Date.now() }
    window.localStorage.setItem('test-key', JSON.stringify(existingDraft))

    const { result } = renderHook(() =>
      usePublishDraft({ storageKey: 'test-key' })
    )

    expect(result.current.draft).toEqual(existingDraft)
  })

  test('saves draft immediately with saveNow', () => {
    const { result } = renderHook(() =>
      usePublishDraft<{ title: string }>({ storageKey: 'test-key' })
    )

    act(() => {
      result.current.saveNow({ title: 'New Title' })
    })

    const saved = JSON.parse(window.localStorage.getItem('test-key') || '{}')
    expect(saved.title).toBe('New Title')
    expect(saved.updatedAt).toBeDefined()
  })

  test('schedules save with delay', () => {
    const { result } = renderHook(() =>
      usePublishDraft<{ title: string }>({ storageKey: 'test-key' })
    )

    act(() => {
      result.current.scheduleSave({ title: 'Scheduled' }, 1000)
    })

    // Should not save immediately
    expect(window.localStorage.getItem('test-key')).toBeNull()

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const saved = JSON.parse(window.localStorage.getItem('test-key') || '{}')
    expect(saved.title).toBe('Scheduled')
  })

  test('clears draft from storage', () => {
    window.localStorage.setItem(
      'test-key',
      JSON.stringify({ title: 'Test', updatedAt: Date.now() })
    )

    const { result } = renderHook(() =>
      usePublishDraft({ storageKey: 'test-key' })
    )

    expect(result.current.draft).not.toBeNull()

    act(() => {
      result.current.clear()
    })

    expect(result.current.draft).toBeNull()
    expect(window.localStorage.getItem('test-key')).toBeNull()
  })

  test('uses custom parser when provided', () => {
    const customParser = vi.fn((raw: string) => {
      const parsed = JSON.parse(raw)
      return { ...parsed, custom: true }
    })

    window.localStorage.setItem(
      'test-key',
      JSON.stringify({ title: 'Test', updatedAt: Date.now() })
    )

    const { result } = renderHook(() =>
      usePublishDraft({ storageKey: 'test-key', parser: customParser })
    )

    expect(customParser).toHaveBeenCalled()
    expect(result.current.draft).toHaveProperty('custom', true)
  })

  test('uses custom serializer when provided', () => {
    const customSerializer = vi.fn((draft) => JSON.stringify(draft))

    const { result } = renderHook(() =>
      usePublishDraft<{ title: string }>({
        storageKey: 'test-key',
        serializer: customSerializer,
      })
    )

    act(() => {
      result.current.saveNow({ title: 'Test' })
    })

    expect(customSerializer).toHaveBeenCalled()
  })

  test('skips save if data is unchanged', () => {
    const { result } = renderHook(() =>
      usePublishDraft<{ title: string }>({ storageKey: 'test-key' })
    )

    act(() => {
      result.current.saveNow({ title: 'Title' })
    })

    const firstSave = window.localStorage.getItem('test-key')

    // Try to save again with same data
    act(() => {
      result.current.saveNow({ title: 'Title' })
    })

    const secondSave = window.localStorage.getItem('test-key')

    expect(firstSave).toBe(secondSave)
  })

  test('uses custom isEqual when provided', () => {
    const customIsEqual = vi.fn((a, b) => a.title === b.title)

    const { result } = renderHook(() =>
      usePublishDraft<{ title: string; extra?: string }>({
        storageKey: 'test-key',
        isEqual: customIsEqual,
      })
    )

    act(() => {
      result.current.saveNow({ title: 'Title', extra: 'data1' })
    })

    act(() => {
      result.current.saveNow({ title: 'Title', extra: 'data2' })
    })

    expect(customIsEqual).toHaveBeenCalled()
  })

  test('handles parse errors gracefully', () => {
    window.localStorage.setItem('test-key', 'invalid json')

    const { result } = renderHook(() =>
      usePublishDraft({ storageKey: 'test-key' })
    )

    expect(result.current.draft).toBeNull()
  })

  test('cancels scheduled save when new save is scheduled', () => {
    const { result } = renderHook(() =>
      usePublishDraft<{ title: string }>({ storageKey: 'test-key' })
    )

    act(() => {
      result.current.scheduleSave({ title: 'First' }, 1000)
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    act(() => {
      result.current.scheduleSave({ title: 'Second' }, 1000)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const saved = JSON.parse(window.localStorage.getItem('test-key') || '{}')
    expect(saved.title).toBe('Second')
  })
})
