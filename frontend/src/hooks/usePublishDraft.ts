import { DraftWithMeta } from '@utils/drafts'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_AUTOSAVE_DELAY } from '@src/constants/constants'

export type PublishDraft<TDraft> = DraftWithMeta<TDraft>

type UsePublishDraftParams<TDraft> = {
  storageKey: string
  serializer?: (draft: PublishDraft<TDraft>) => string
  parser?: (raw: string) => PublishDraft<TDraft> | null
  isEqual?: (a: TDraft, b: TDraft) => boolean
}

export const usePublishDraft = <TDraft>(
  params: UsePublishDraftParams<TDraft>
) => {
  const { storageKey, serializer, parser, isEqual } = params

  const parse = useCallback(
    (raw: string): PublishDraft<TDraft> | null => {
      try {
        if (parser) return parser(raw)
        return JSON.parse(raw) as PublishDraft<TDraft>
      } catch {
        return null
      }
    },
    [parser]
  )

  const [draft, setDraft] = useState<PublishDraft<TDraft> | null>(() => {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    return parse(raw)
  })

  const lastSavedRef = useRef<PublishDraft<TDraft> | null>(draft)

  const dataEqual = useCallback(
    (a: TDraft, b: TDraft) =>
      isEqual ? isEqual(a, b) : JSON.stringify(a) === JSON.stringify(b),
    [isEqual]
  )

  const getDataPart = useCallback((pd: PublishDraft<TDraft>): TDraft => {
    const { updatedAt: _updatedAt, ...rest } = pd as unknown as {
      updatedAt?: number
    } & TDraft
    return rest as TDraft
  }, [])

  const persist = useCallback(
    (next: PublishDraft<TDraft>) => {
      if (typeof window === 'undefined') return
      const serialized = serializer ? serializer(next) : JSON.stringify(next)
      window.localStorage.setItem(storageKey, serialized)
      setDraft(next)
      lastSavedRef.current = next
    },
    [serializer, storageKey]
  )

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(storageKey)
    setDraft(null)
    lastSavedRef.current = null
  }, [storageKey])

  const scheduleRef = useRef<number | null>(null)

  const scheduleSave = useCallback(
    (data: TDraft, delay = DEFAULT_AUTOSAVE_DELAY) => {
      // Skip scheduling if unchanged vs last saved
      if (
        lastSavedRef.current &&
        dataEqual(getDataPart(lastSavedRef.current), data)
      ) {
        return
      }

      if (scheduleRef.current) {
        window.clearTimeout(scheduleRef.current)
      }
      scheduleRef.current = window.setTimeout(() => {
        persist({ ...data, updatedAt: Date.now() } as PublishDraft<TDraft>)
        scheduleRef.current = null
      }, delay)
    },
    [dataEqual, getDataPart, persist]
  )

  const saveNow = useCallback(
    (data: TDraft) => {
      if (
        lastSavedRef.current &&
        dataEqual(getDataPart(lastSavedRef.current), data)
      ) {
        // No-op if unchanged
        return
      }
      if (scheduleRef.current) {
        window.clearTimeout(scheduleRef.current)
        scheduleRef.current = null
      }
      persist({ ...data, updatedAt: Date.now() } as PublishDraft<TDraft>)
    },
    [dataEqual, getDataPart, persist]
  )

  useEffect(() => {
    return () => {
      if (scheduleRef.current) {
        window.clearTimeout(scheduleRef.current)
        scheduleRef.current = null
      }
    }
  }, [])

  return {
    draft,
    saveNow,
    scheduleSave,
    clear,
  }
}
