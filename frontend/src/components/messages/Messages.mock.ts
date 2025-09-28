import { Conversation } from '@components/messages/Messages.types'

export const mockConversations: Conversation[] = [
  {
    id: 0,
    user: {
      name: 'Bot',
      avatar: 'https://i.pravatar.cc/40?u=bot',
      online: true,
    },
    badges: [],
    messages: [],
  },
  {
    id: 1,
    user: {
      name: 'Samuel',
      avatar: 'https://i.pravatar.cc/40?img=1',
      online: true,
    },
    badges: ['book'],
    messages: [
      {
        id: 1,
        role: 'them',
        text: 'Puedo cambiarlo por tu libro',
        time: '4:30 PM',
      },
      {
        id: 2,
        role: 'me',
        text: '¡Hola! Estoy interesado en Matar a un ruiseñor',
        time: '4:32 PM',
      },
      {
        id: 3,
        role: 'them',
        text: '¡Claro! ¿Ofreces algún libro para el intercambio?',
        time: '4:35 PM',
      },
      {
        id: 4,
        role: 'me',
        text: 'Puedo cambiarlo por tu libro',
        book: {
          title: 'Crónica del pájaro que da cuerda al mundo',
          author: 'Haruki Murakami',
          cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg',
        },
        time: '4:37 PM',
      },
      {
        id: 5,
        role: 'them',
        text: '¡Perfecto!',
        time: '4:37 PM',
      },
      {
        id: 6,
        role: 'me',
        type: 'agreementProposal',
        proposal: {
          meetingPoint: 'Rincón Parque Central',
          area: 'Nervión (Sevilla)',
          date: 'martes',
          time: '19:00',
          bookTitle: 'El nombre del viento',
        },
        time: '4:40 PM',
      },
      {
        id: 7,
        role: 'them',
        type: 'agreementConfirmation',
        agreement: {
          meetingPoint: 'Rincón Parque Central',
          area: 'Nervión (Sevilla)',
          date: 'martes',
          time: '19:00',
          bookTitle: 'El nombre del viento',
        },
        confirmedBy: 'Samuel',
        time: '4:42 PM',
      },
    ],
  },
  {
    id: 2,
    user: {
      name: 'Laura',
      avatar: 'https://i.pravatar.cc/40?img=2',
      online: false,
      lastSeen: '2h ago',
    },
    badges: ['unread'],
    messages: [
      {
        id: 1,
        role: 'them',
        text: '¡Genial, gracias!',
        time: '1:15 PM',
      },
    ],
  },
  {
    id: 3,
    user: {
      name: 'Pablo',
      avatar: 'https://i.pravatar.cc/40?img=3',
      online: false,
      lastSeen: '5m ago',
    },
    badges: ['swap'],
    messages: [
      {
        id: 1,
        role: 'them',
        text: 'Solicitud de intercambio pendiente',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 4,
    user: {
      name: 'Sophia',
      avatar: 'https://i.pravatar.cc/40?img=4',
      online: false,
      lastSeen: 'online',
    },
    badges: [],
    messages: [
      {
        id: 1,
        role: 'them',
        text: '¡Guau, suena como un gran libro!',
        time: 'Yesterday',
      },
    ],
  },
]
