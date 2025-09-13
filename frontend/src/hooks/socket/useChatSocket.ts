import { useCallback, useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

export interface ChatMessage {
  text: string
  user: { id: number; name: string }
  timestamp: string
  channel: string
}

export const useChatSocket = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:4000'
    const s = io(url, { withCredentials: true })
    setSocket(s)
    s.on('user', (u: { id: number; name: string }) => setCurrentUser(u))
    s.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
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
  }, [])

  const sendMessage = useCallback(
    (text: string, channel?: string) => {
      if (socket) {
        socket.emit('message', { text, channel })
      }
    },
    [socket]
  )

  return { messages, sendMessage, currentUser, isConnected, error }
}
