import { agreementQueryKeys } from '@api/agreements/agreements'
import {
  messageQueryKeys,
  type ApiMessageAttachment,
} from '@api/messages/messages'
import { notificationKeys } from '@api/notifications/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { isApiMockMode } from '@utils/runtimeEnv'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import type { MessageDeliveryState } from '@src/shared/view-models/types'

export interface ConversationMessage {
  conversationId: number
  sequence: number
  senderId: number
  body: string
  clientKey: string
  createdAt: string
  attachmentMetadata: ApiMessageAttachment | null
  deliveryState?: MessageDeliveryState
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
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: number
    name: string
  } | null>(null)
  const currentUserRef = useRef<{ id: number; name: string } | null>(null)
  const [isConnected, setIsConnected] = useState(mockMode)
  const [error, setError] = useState<string | null>(null)
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])
  const [agreementUpdates, setAgreementUpdates] = useState<AgreementUpdate[]>(
    []
  )
  const [messageStatuses, setMessageStatuses] = useState<
    Record<string, MessageDeliveryState>
  >({})

  const advanceMessageStatus = useCallback(
    (conversationId: number, sequence: number, state: MessageDeliveryState) => {
      const key = `${conversationId}:${sequence}`
      const rank: Record<MessageDeliveryState, number> = {
        sent: 1,
        delivered: 2,
        read: 3,
      }
      setMessageStatuses((previous) => {
        const current = previous[key]
        if (current && rank[current] >= rank[state]) return previous
        return { ...previous, [key]: state }
      })
    },
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
    s.on('user', (u: { id: number; name: string }) => {
      currentUserRef.current = u
      setCurrentUser(u)
    })
    s.on('conversation:message', (msg: ConversationMessage) => {
      // Delivery is acknowledged after the committed event is received (or
      // replayed), while the HTTP command remains the only persistence path.
      s.emit('conversation:delivered', {
        conversationId: msg.conversationId,
        sequence: msg.sequence,
      })
      if (msg.deliveryState) {
        advanceMessageStatus(
          msg.conversationId,
          msg.sequence,
          msg.deliveryState
        )
      }
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      void queryClient.invalidateQueries({
        queryKey: messageQueryKeys.conversations(),
      })
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
    s.on(
      'conversation:delivered',
      (payload: {
        conversationId: number
        sequence: number
        userId: number
      }) => {
        void queryClient.invalidateQueries({
          queryKey: messageQueryKeys.history(payload.conversationId),
        })
        advanceMessageStatus(
          payload.conversationId,
          payload.sequence,
          'delivered'
        )
      }
    )
    s.on(
      'conversation:read',
      (payload: {
        conversationId: number
        sequence: number
        userId: number
      }) => {
        if (payload.userId === currentUserRef.current?.id) return
        void queryClient.invalidateQueries({
          queryKey: messageQueryKeys.history(payload.conversationId),
        })
        advanceMessageStatus(payload.conversationId, payload.sequence, 'read')
      }
    )
    s.on('agreement:updated', (update: AgreementUpdate) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
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
  }, [advanceMessageStatus, mockMode, queryClient])

  const joinConversation = useCallback(
    (conversationId: number, after = 0) => {
      socket?.emit('conversation:join', { conversationId, after })
    },
    [socket]
  )

  const notifyConversationRead = useCallback(
    (conversationId: number, sequence: number) => {
      socket?.emit('conversation:read', { conversationId, sequence })
    },
    [socket]
  )

  return {
    conversationMessages,
    messageStatuses,
    agreementUpdates,
    joinConversation,
    notifyConversationRead,
    currentUser,
    isConnected,
    error,
  }
}
