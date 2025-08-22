export type Book = {
  title: string
  author: string
  cover: string
}

export type Message = {
  id: number
  sender: 'me' | 'them'
  text?: string
  book?: Book
  time: string
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
