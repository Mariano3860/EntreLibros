import { useCallback, useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

export interface ChatMessage {
  text: string
  user: { id: number; name: string }
}

export const useChatSocket = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const url = import.meta.env.PUBLIC_API_BASE_URL || ''
    const s = io(url, { withCredentials: true })
    setSocket(s)
    s.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })
    return () => {
      s.disconnect()
    }
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      if (socket) {
        socket.emit('message', text)
      }
    },
    [socket]
  )

  return { messages, sendMessage }
}
