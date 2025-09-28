export type MessageRole = 'me' | 'them' | 'system'

export type AgreementLocationType = 'bookCorner' | 'public'

export type AgreementLocation = {
  name: string
  area: string
  type: AgreementLocationType
}

export type AgreementSchedule = {
  day: string
  time: string
}

export type AgreementBook = {
  title: string
}

export type AgreementDetails = {
  location: AgreementLocation
  schedule: AgreementSchedule
  book: AgreementBook
}

export type MessageBase = {
  id: string
  role: MessageRole
  createdAt: string
  /**
   * Optional pre-formatted time label. When provided it takes precedence over
   * the auto-generated value to keep the mock conversation predictable during
   * visual QA.
   */
  displayTime?: string
}

export type TextMessage = MessageBase & {
  type: 'text'
  text: string
}

export type TemplateMessage = MessageBase & {
  type: 'template'
  text: string
  templateLabel: string
}

export type ProposalMessage = MessageBase & {
  type: 'proposal'
  proposal: AgreementDetails
}

export type ConfirmationMessage = MessageBase & {
  type: 'confirmation'
  confirmation: AgreementDetails & { confirmedBy: string }
}

export type ReminderMessage = MessageBase & {
  type: 'reminder'
  reminder: {
    message: string
    details: AgreementDetails
  }
}

export type RescheduleMessage = MessageBase & {
  type: 'reschedule'
  reschedule: {
    note: string
    previous: AgreementDetails
    proposed: {
      schedule: AgreementSchedule
      location?: AgreementLocation
    }
  }
}

export type CancellationMessage = MessageBase & {
  type: 'cancellation'
  cancellation: {
    reason: string
    details?: AgreementDetails
  }
}

export type PostCheckMessage = MessageBase & {
  type: 'post-check'
  question: string
  details: AgreementDetails
}

export type SafetyTipMessage = MessageBase & {
  type: 'safety-tip'
  tip: string
}

export type Message =
  | TextMessage
  | TemplateMessage
  | ProposalMessage
  | ConfirmationMessage
  | ReminderMessage
  | RescheduleMessage
  | CancellationMessage
  | PostCheckMessage
  | SafetyTipMessage

export type ConversationBadge =
  | 'proposalPending'
  | 'agreementConfirmed'
  | 'reminderScheduled'
  | 'awaitingFeedback'
  | 'cancelled'

export type Conversation = {
  id: number
  channel: string
  user: {
    name: string
    avatar: string
    online: boolean
    lastSeen?: string
  }
  badges: ConversationBadge[]
  messages: Message[]
}
