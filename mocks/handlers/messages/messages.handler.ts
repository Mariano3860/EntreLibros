import { http, HttpResponse } from 'msw'

import { Message } from '@src/api/messages/messages.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { generateMessages } from './fakers/messages.faker'

let messages: Message[] = generateMessages()

export const messagesListHandler = http.get(
  RELATIVE_API_ROUTES.MESSAGES.LIST,
  () => {
    return HttpResponse.json(messages, { status: 200 })
  }
)

export const messagesSendHandler = http.post(
  RELATIVE_API_ROUTES.MESSAGES.LIST,
  async ({ request }) => {
    const { content } = (await request.json()) as { content: string }
    const newMessage: Message = {
      id: String(messages.length + 1),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }
    messages = [...messages, newMessage]
    return HttpResponse.json(newMessage, { status: 201 })
  }
)
