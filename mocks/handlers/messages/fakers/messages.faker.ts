import { Message } from '@src/api/messages/messages.types'

export const generateMessages = (): Message[] => [
  {
    id: '1',
    content: 'Hola!',
    sender: 'other',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    content: '¿Qué tal?',
    sender: 'user',
    timestamp: new Date().toISOString(),
  },
]
