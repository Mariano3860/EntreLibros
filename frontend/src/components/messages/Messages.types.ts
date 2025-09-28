export type Book = {
  title: string
  author: string
  cover: string
  ownership?: 'mine' | 'theirs'
  ownerName?: string
}

export type MessageRole = 'me' | 'them' | 'system'

export type MessageTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral'

export type AgreementDetails = {
  meetingPoint: string
  area: string
  date: string
  time: string
  bookTitle: string
}

export type BaseMessage = {
  id: number
  role: MessageRole
  time: string
  tone?: MessageTone
}

export type TextMessage = BaseMessage & {
  type?: 'text'
  text?: string
  book?: Book
}

export type AgreementProposalMessage = BaseMessage & {
  type: 'agreementProposal'
  proposal: AgreementDetails
}

export type AgreementConfirmationMessage = BaseMessage & {
  type: 'agreementConfirmation'
  agreement: AgreementDetails
  confirmedBy: string
}

export type Message =
  | TextMessage
  | AgreementProposalMessage
  | AgreementConfirmationMessage

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
