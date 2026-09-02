import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { isApiMockMode } from '@src/utils/runtimeEnv'

import { prototypeCatalog, type PrototypeChatMessage } from './catalog'

type SocialPost = {
  id: string
  author: string
  text: string
  createdAt: string
}

type PrototypeContextValue = {
  catalog: typeof prototypeCatalog
  period: string
  setPeriod: (period: string) => void
  socialPosts: SocialPost[]
  publishStory: (text: string) => void
  chatMessages: PrototypeChatMessage[]
  sendMessage: (text: string, kind?: PrototypeChatMessage['kind']) => void
  readConversationIds: ReadonlySet<string>
  markConversationRead: (conversationId: string) => void
  openFaq: string | null
  setOpenFaq: (id: string | null) => void
  supportSent: boolean
  sendSupport: () => void
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export const PrototypeProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const mockMode = isApiMockMode()
  const [period, setPeriod] = useState('Últimos 7 días')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [chatMessages, setChatMessages] = useState<PrototypeChatMessage[]>(
    () => (mockMode ? [...prototypeCatalog.chatMessages] : [])
  )
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(
    () => new Set()
  )
  const [openFaq, setOpenFaq] = useState<string | null>('publish')
  const [supportSent, setSupportSent] = useState(false)
  const markConversationRead = useCallback(
    (conversationId: string) => {
      if (!mockMode) return
      setReadConversationIds((current) => {
        if (current.has(conversationId)) return current
        const next = new Set(current)
        next.add(conversationId)
        return next
      })
    },
    [mockMode]
  )
  const value = useMemo<PrototypeContextValue>(
    () => ({
      catalog: prototypeCatalog,
      period,
      setPeriod,
      socialPosts,
      publishStory: (text) => {
        if (!mockMode) return
        setSocialPosts((current) => [
          {
            id: `post-${current.length + 1}`,
            author: 'Mariano',
            text,
            createdAt: 'Ahora',
          },
          ...current,
        ])
      },
      chatMessages,
      sendMessage: (text, kind) => {
        if (!mockMode) return
        setChatMessages((current) => [
          ...current,
          {
            id: `message-${current.length + 1}`,
            role: 'me',
            text,
            time: 'Ahora',
            kind,
          },
        ])
      },
      readConversationIds,
      markConversationRead,
      openFaq,
      setOpenFaq,
      supportSent,
      sendSupport: () => {
        if (mockMode) setSupportSent(true)
      },
    }),
    [
      chatMessages,
      markConversationRead,
      mockMode,
      openFaq,
      period,
      readConversationIds,
      socialPosts,
      supportSent,
    ]
  )

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  )
}

export const usePrototype = () => {
  const value = useContext(PrototypeContext)
  if (!value)
    throw new Error('usePrototype must be used inside PrototypeProvider')
  return value
}
