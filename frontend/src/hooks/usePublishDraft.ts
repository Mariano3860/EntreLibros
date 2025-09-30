import { DraftWithMeta } from '@utils/drafts'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_AUTOSAVE_DELAY } from '@src/constants/constants'

export type PublishDraft<TDraft> = DraftWithMeta<TDraft>

type UsePublishDraftParams<TDraft> = {
  storageKey: string
  serializer?: (draft: PublishDraft<TDraft>) => string
  parser?: (raw: string) => PublishDraft<TDraft> | null
}

export const usePublishDraft = <TDraft>(
  params: UsePublishDraftParams<TDraft>
) => {
  const { storageKey, serializer, parser } = params
  const parse = useCallback(
    (raw: string): PublishDraft<TDraft> | null => {
      try {
        if (parser) {
          return parser(raw)
        }
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
      if (scheduleRef.current) {
        window.clearTimeout(scheduleRef.current)
      }
      scheduleRef.current = window.setTimeout(() => {
        persist({ ...data, updatedAt: Date.now() })
        scheduleRef.current = null
      }, delay)
    },
    [persist]
  )

  const saveNow = useCallback(
    (data: TDraft) => {
      if (scheduleRef.current) {
        window.clearTimeout(scheduleRef.current)
        scheduleRef.current = null
      }
      persist({ ...data, updatedAt: Date.now() })
    },
    [persist]
  )

  // cleanup pending timeout on unmount
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
