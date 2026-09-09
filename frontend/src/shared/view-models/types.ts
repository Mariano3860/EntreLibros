export type BookCardView = {
  id: string
  title: string
  author: string
  owner: string
  ownerId?: string
  isExternal?: boolean
  distance: string
  mode: 'Intercambio' | 'Venta' | 'Buscado'
  intentions?: Array<'trade' | 'sale' | 'seeking'>
  price?: string
  coverUrl?: string
  condition?: string
  accent: string
  genre: string
}

export type ConversationView = {
  id: string
  name: string
  initials: string
  preview: string
  time: string
  unread?: number
  online?: boolean
  accent: string
}

export type ChatBookView = {
  id: string
  title: string
  author: string
  coverUrl: string
}

export type MessageDeliveryState = 'sent' | 'delivered' | 'read'

export type ChatMessageView = {
  id: string
  role: 'me' | 'them'
  text: string
  time: string
  deliveryState?: MessageDeliveryState
  kind?: 'book' | 'proposal' | 'swap' | 'agreement'
  book?: ChatBookView
  swap?: {
    offered: ChatBookView
    requested: ChatBookView
    note?: string
  }
  agreement?: {
    agreementId: number
    version: number
    event:
      | 'proposal'
      | 'counterproposal'
      | 'confirm'
      | 'cancel'
      | 'reject'
      | 'complete'
    meetingPoint: string
    area: string
    date: string
    time: string
    bookTitle: string
    actorName: string
    reason?: string
  }
}
