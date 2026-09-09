import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import {
  mockExperienceFixtures,
  type MockExperienceFixtures,
} from '@src/mocks/fixtures/experience'
import type { ChatMessageView } from '@src/shared/view-models/types'
import { isApiMockMode } from '@src/utils/runtimeEnv'

type SocialPost = {
  id: string
  author: string
  text: string
  createdAt: string
}

type MockExperienceContextValue = {
  fixtures: MockExperienceFixtures
  socialPosts: SocialPost[]
  publishStory: (text: string) => void
  chatMessages: ChatMessageView[]
  sendMessage: (text: string, kind?: ChatMessageView['kind']) => void
  readConversationIds: ReadonlySet<string>
  markConversationRead: (conversationId: string) => void
}

const MockExperienceContext = createContext<MockExperienceContextValue | null>(
  null
)

export const MockExperienceProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const mockMode = isApiMockMode()
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessageView[]>(() =>
    mockMode ? [...mockExperienceFixtures.chatMessages] : []
  )
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(
    () => new Set()
  )
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
  const value = useMemo<MockExperienceContextValue>(
    () => ({
      fixtures: mockExperienceFixtures,
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
    }),
    [
      chatMessages,
      markConversationRead,
      mockMode,
      readConversationIds,
      socialPosts,
    ]
  )

  return (
    <MockExperienceContext.Provider value={value}>
      {children}
    </MockExperienceContext.Provider>
  )
}

export const useMockExperience = () => {
  const value = useContext(MockExperienceContext)
  if (!value)
    throw new Error(
      'useMockExperience must be used inside MockExperienceProvider'
    )
  return value
}
