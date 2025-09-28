export type Book = {
  title: string
  author: string
  cover: string
}

export type MessageRole = 'me' | 'them' | 'system'

export type MessageTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral'

export type Message = {
  id: number
  role: MessageRole
  text?: string
  book?: Book
  time: string
  tone?: MessageTone
}

export type Conversation = {
  id: number
  user: {
    name: string
    avatar: string
    online: boolean
    lastSeen?: string
  }
  badges: ('unread' | 'book' | 'swap')[]
  messages: Message[]
}
