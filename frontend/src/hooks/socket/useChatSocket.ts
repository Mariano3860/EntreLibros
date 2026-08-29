import { agreementQueryKeys } from '@api/agreements/agreements'
import { messageQueryKeys } from '@api/messages/messages'
import { notificationKeys } from '@api/notifications/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { isApiMockMode } from '@utils/runtimeEnv'
import { useCallback, useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

export interface ChatMessage {
  text: string
  user: { id: number; name: string }
  timestamp: string
  channel: string
}

export interface ConversationMessage {
  conversationId: number
  sequence: number
  senderId: number
  body: string
  clientKey: string
  createdAt: string
}

export interface AgreementUpdate {
  agreementId: number
  conversationId: number
  state: string
  currentVersion: number
}

export const useChatSocket = () => {
  const queryClient = useQueryClient()
  const mockMode = isApiMockMode()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isConnected, setIsConnected] = useState(mockMode)
  const [error, setError] = useState<string | null>(null)
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])
  const [agreementUpdates, setAgreementUpdates] = useState<AgreementUpdate[]>(
    []
  )

  useEffect(() => {
    if (mockMode) {
      setIsConnected(true)
      setError(null)
      return
    }
    const apiUrl = import.meta.env?.PUBLIC_API_BASE_URL || '/api'
    // Ensure we connect to the server origin without an API prefix to avoid
    // Socket.IO "Invalid namespace" errors in production environments.
    const { origin } = new URL(apiUrl, window.location.origin)
    const s = io(origin, { withCredentials: true })
    setSocket(s)
    s.on('user', (u: { id: number; name: string }) => setCurrentUser(u))
    s.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })
    s.on('conversation:message', (msg: ConversationMessage) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      void queryClient.invalidateQueries({
        queryKey: messageQueryKeys.history(msg.conversationId),
      })
      setConversationMessages((prev) => {
        const duplicate = prev.some(
          (item) =>
            item.conversationId === msg.conversationId &&
            item.sequence === msg.sequence
        )
        return duplicate ? prev : [...prev, msg]
      })
    })
    s.on('agreement:updated', (update: AgreementUpdate) => {
      void queryClient.invalidateQueries({
        queryKey: agreementQueryKeys.detail(update.agreementId),
      })
      setAgreementUpdates((prev) =>
        prev.some(
          (item) =>
            item.agreementId === update.agreementId &&
            item.currentVersion === update.currentVersion
        )
          ? prev
          : [...prev, update]
      )
    })
    s.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })
    s.on('disconnect', () => {
      setIsConnected(false)
    })
    s.on('connect_error', (err) => {
      setError(err.message)
      setIsConnected(false)
    })
    return () => {
      s.disconnect()
    }
  }, [mockMode, queryClient])

  const sendMessage = useCallback(
    (text: string, channel?: string) => {
      if (mockMode) {
        if (channel !== 'Bot' && !/^@bot\b/i.test(text)) return
        const cleanText = text.replace(/^@bot\s*/i, '').trim()
        const reply = /^(hola|hello)/i.test(cleanText)
          ? '¡Hola! Soy el bot de EntreLibros.'
          : `Recibí tu mensaje: ${cleanText}`
        setMessages((prev) => [
          ...prev,
          {
            text: reply,
            user: { id: 0, name: 'Bot' },
            timestamp: new Date().toISOString(),
            channel: channel ?? 'Bot',
          },
        ])
        return
      }
      if (socket) {
        socket.emit('message', { text, channel })
      }
    },
    [mockMode, socket]
  )

  const sendConversationMessage = useCallback(
    (conversationId: number, clientKey: string, body: string) => {
      socket?.emit('conversation:message', {
        conversationId,
        clientKey,
        body,
      })
    },
    [socket]
  )

  const joinConversation = useCallback(
    (conversationId: number, after = 0) => {
      socket?.emit('conversation:join', { conversationId, after })
    },
    [socket]
  )

  return {
    messages,
    conversationMessages,
    agreementUpdates,
    sendMessage,
    sendConversationMessage,
    joinConversation,
    currentUser,
    isConnected,
    error,
  }
}
