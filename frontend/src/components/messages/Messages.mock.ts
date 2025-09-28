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
        type: 'text',
        text: '¡Hola! Estoy interesado en tu libro «El nombre del viento». ¿Sigue disponible?',
        book: {
          title: 'El nombre del viento',
          author: 'Patrick Rothfuss',
          cover: 'https://covers.openlibrary.org/b/id/9259256-S.jpg',
          ownership: 'mine',
        },
        time: '4:30 PM',
      },
      {
        id: 2,
        role: 'me',
        type: 'text',
        text: '¡Hola, Samuel! Sí, sigue disponible. Estuve revisando tus estanterías y me gustaría cambiarlo por «Crónica del pájaro que da cuerda al mundo».',
        book: {
          title: 'Crónica del pájaro que da cuerda al mundo',
          author: 'Haruki Murakami',
          cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg',
          ownership: 'theirs',
          ownerName: 'Samuel',
        },
        time: '4:33 PM',
      },
      {
        id: 3,
        role: 'them',
        type: 'text',
        text: '¡Perfecto! Me encanta la idea, coordinemos el intercambio.',
        time: '4:35 PM',
      },
      {
        id: 4,
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
        id: 5,
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
