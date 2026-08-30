import { createContext, useContext, useMemo, useState } from 'react'

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
  const [period, setPeriod] = useState('Últimos 7 días')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [chatMessages, setChatMessages] = useState<PrototypeChatMessage[]>([
    ...prototypeCatalog.chatMessages,
  ])
  const [openFaq, setOpenFaq] = useState<string | null>('publish')
  const [supportSent, setSupportSent] = useState(false)

  const value = useMemo<PrototypeContextValue>(
    () => ({
      catalog: prototypeCatalog,
      period,
      setPeriod,
      socialPosts,
      publishStory: (text) =>
        setSocialPosts((current) => [
          {
            id: `post-${current.length + 1}`,
            author: 'Mariano',
            text,
            createdAt: 'Ahora',
          },
          ...current,
        ]),
      chatMessages,
      sendMessage: (text, kind) =>
        setChatMessages((current) => [
          ...current,
          {
            id: `message-${current.length + 1}`,
            role: 'me',
            text,
            time: 'Ahora',
            kind,
          },
        ]),
      openFaq,
      setOpenFaq,
      supportSent,
      sendSupport: () => setSupportSent(true),
    }),
    [chatMessages, openFaq, period, socialPosts, supportSent]
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
