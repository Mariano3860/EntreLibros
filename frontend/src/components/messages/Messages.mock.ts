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
    myBooks: [
      {
        id: 'bot-1',
        title: 'La biblioteca secreta',
        author: 'EntreLibros',
        cover: 'https://covers.openlibrary.org/b/id/9259256-S.jpg',
        ownership: 'mine',
      },
    ],
    theirBooks: [],
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
    myBooks: [
      {
        id: 'me-1',
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        cover: 'https://covers.openlibrary.org/b/id/9259256-S.jpg',
        ownership: 'mine',
      },
      {
        id: 'me-2',
        title: 'La Comunidad del Anillo',
        author: 'J.R.R. Tolkien',
        cover: 'https://covers.openlibrary.org/b/id/8231856-S.jpg',
        ownership: 'mine',
      },
    ],
    theirBooks: [
      {
        id: 'samuel-1',
        title: 'Crónica del pájaro que da cuerda al mundo',
        author: 'Haruki Murakami',
        cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg',
        ownership: 'theirs',
        ownerName: 'Samuel',
      },
      {
        id: 'samuel-2',
        title: 'La ciudad y los perros',
        author: 'Mario Vargas Llosa',
        cover: 'https://covers.openlibrary.org/b/id/11153227-S.jpg',
        ownership: 'theirs',
        ownerName: 'Samuel',
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
    myBooks: [
      {
        id: 'me-3',
        title: 'Rayuela',
        author: 'Julio Cortázar',
        cover: 'https://covers.openlibrary.org/b/id/8101340-S.jpg',
        ownership: 'mine',
      },
    ],
    theirBooks: [
      {
        id: 'laura-1',
        title: 'Middlesex',
        author: 'Jeffrey Eugenides',
        cover: 'https://covers.openlibrary.org/b/id/8371281-S.jpg',
        ownership: 'theirs',
        ownerName: 'Laura',
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
    myBooks: [
      {
        id: 'me-4',
        title: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://covers.openlibrary.org/b/id/9251992-S.jpg',
        ownership: 'mine',
      },
    ],
    theirBooks: [
      {
        id: 'pablo-1',
        title: 'Neuromante',
        author: 'William Gibson',
        cover: 'https://covers.openlibrary.org/b/id/9255402-S.jpg',
        ownership: 'theirs',
        ownerName: 'Pablo',
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
    myBooks: [
      {
        id: 'me-5',
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        cover: 'https://covers.openlibrary.org/b/id/8081531-S.jpg',
        ownership: 'mine',
      },
    ],
    theirBooks: [
      {
        id: 'sophia-1',
        title: 'La casa de los espíritus',
        author: 'Isabel Allende',
        cover: 'https://covers.openlibrary.org/b/id/8225269-S.jpg',
        ownership: 'theirs',
        ownerName: 'Sophia',
      },
    ],
  },
]
