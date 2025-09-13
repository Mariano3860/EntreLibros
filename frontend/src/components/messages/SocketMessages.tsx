import { useChatSocket } from '@hooks/socket/useChatSocket'
import { useState } from 'react'

export const SocketMessages = () => {
  const { messages, sendMessage } = useChatSocket()
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(text.trim())
    setText('')
  }

  return (
    <div>
      <ul>
        {messages.map((m, idx) => (
          <li key={idx}>
            <strong>{m.user.name}:</strong> {m.text}
          </li>
        ))}
      </ul>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
