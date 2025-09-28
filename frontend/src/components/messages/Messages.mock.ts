import { Conversation } from '@components/messages/Messages.types'

const baseAgreement = {
  location: {
    name: 'Rincón Parque Central',
    area: 'Nervión, Sevilla',
    type: 'bookCorner' as const,
  },
  schedule: {
    day: 'Martes 4 de marzo',
    time: '19:00',
  },
  book: {
    title: 'El nombre del viento',
  },
}

const updatedAgreement = {
  ...baseAgreement,
  schedule: {
    day: 'Martes 4 de marzo',
    time: '19:30',
  },
}

export const mockConversations: Conversation[] = [
  {
    id: 1,
    channel: 'Samuel',
    user: {
      name: 'Samuel',
      avatar: 'https://i.pravatar.cc/96?img=5',
      online: true,
    },
    badges: ['agreementConfirmed', 'awaitingFeedback'],
    messages: [
      {
        id: '1',
        role: 'me',
        type: 'template',
        text: 'Hola, me interesa El nombre del viento. ¿Sigue en intercambio?',
        templateLabel: 'Plantilla: interés por título',
        createdAt: '2025-03-01T17:02:00.000Z',
        displayTime: '17:02',
      },
      {
        id: '2',
        role: 'them',
        type: 'text',
        text: 'Sí, perfecto. Lo tengo listo para intercambio.',
        createdAt: '2025-03-01T17:04:00.000Z',
        displayTime: '17:04',
      },
      {
        id: '3',
        role: 'me',
        type: 'proposal',
        proposal: baseAgreement,
        createdAt: '2025-03-01T17:06:00.000Z',
        displayTime: '17:06',
      },
      {
        id: '4',
        role: 'system',
        type: 'safety-tip',
        tip: 'Reúnete en un espacio público o un Rincón de Libros. Avisa a alguien de confianza.',
        createdAt: '2025-03-01T17:06:30.000Z',
        displayTime: '17:06',
      },
      {
        id: '5',
        role: 'them',
        type: 'confirmation',
        confirmation: {
          ...baseAgreement,
          confirmedBy: 'Samuel',
        },
        createdAt: '2025-03-01T17:08:00.000Z',
        displayTime: '17:08',
      },
      {
        id: '6',
        role: 'system',
        type: 'reminder',
        reminder: {
          message:
            'Mañana 19:00 en Rincón Parque Central (Nervión) por El nombre del viento.',
          details: baseAgreement,
        },
        createdAt: '2025-03-03T19:00:00.000Z',
        displayTime: '19:00',
      },
      {
        id: '7',
        role: 'system',
        type: 'reminder',
        reminder: {
          message:
            'Hoy 19:00 en Rincón Parque Central (Nervión) por El nombre del viento.',
          details: baseAgreement,
        },
        createdAt: '2025-03-04T10:00:00.000Z',
        displayTime: '10:00',
      },
      {
        id: '8',
        role: 'me',
        type: 'reschedule',
        reschedule: {
          note: '¿19:30 mismo lugar? Salgo de una reunión a esa hora.',
          previous: baseAgreement,
          proposed: {
            schedule: updatedAgreement.schedule,
          },
        },
        createdAt: '2025-03-04T12:10:00.000Z',
        displayTime: '12:10',
      },
      {
        id: '9',
        role: 'them',
        type: 'confirmation',
        confirmation: {
          ...updatedAgreement,
          confirmedBy: 'Samuel',
        },
        createdAt: '2025-03-04T12:14:00.000Z',
        displayTime: '12:14',
      },
      {
        id: '10',
        role: 'system',
        type: 'post-check',
        question: '¿Se concretó el intercambio?',
        details: updatedAgreement,
        createdAt: '2025-03-04T21:00:00.000Z',
        displayTime: '21:00',
      },
      {
        id: '11',
        role: 'me',
        type: 'text',
        text: 'Sí, gracias por coordinar. ¡Nos vemos en el próximo intercambio!',
        createdAt: '2025-03-05T08:00:00.000Z',
        displayTime: '08:00',
      },
    ],
  },
  {
    id: 2,
    channel: 'Laura',
    user: {
      name: 'Laura',
      avatar: 'https://i.pravatar.cc/96?img=12',
      online: false,
      lastSeen: 'Hace 2 h',
    },
    badges: ['proposalPending'],
    messages: [
      {
        id: '1',
        role: 'them',
        type: 'text',
        text: 'Hola, vi que buscas El infinito en un junco. ¿Te interesa coordinar?',
        createdAt: '2025-02-26T15:00:00.000Z',
        displayTime: '15:00',
      },
      {
        id: '2',
        role: 'me',
        type: 'text',
        text: 'Sí, me encanta. ¿Qué día te sirve?',
        createdAt: '2025-02-26T15:02:00.000Z',
        displayTime: '15:02',
      },
      {
        id: '3',
        role: 'them',
        type: 'proposal',
        proposal: {
          location: {
            name: 'Biblioteca Popular San Martín',
            area: 'Caballito, Buenos Aires',
            type: 'public',
          },
          schedule: {
            day: 'Jueves 27 de febrero',
            time: '18:30',
          },
          book: {
            title: 'El infinito en un junco',
          },
        },
        createdAt: '2025-02-26T15:05:00.000Z',
        displayTime: '15:05',
      },
      {
        id: '4',
        role: 'me',
        type: 'reschedule',
        reschedule: {
          note: 'Salgo 18:15 del trabajo, ¿podemos pasarla a las 19:00?',
          previous: {
            location: {
              name: 'Biblioteca Popular San Martín',
              area: 'Caballito, Buenos Aires',
              type: 'public',
            },
            schedule: {
              day: 'Jueves 27 de febrero',
              time: '18:30',
            },
            book: { title: 'El infinito en un junco' },
          },
          proposed: {
            schedule: {
              day: 'Jueves 27 de febrero',
              time: '19:00',
            },
            location: {
              name: 'Biblioteca Popular San Martín',
              area: 'Caballito, Buenos Aires',
              type: 'public',
            },
          },
        },
        createdAt: '2025-02-26T15:08:00.000Z',
        displayTime: '15:08',
      },
    ],
  },
  {
    id: 3,
    channel: 'Pablo',
    user: {
      name: 'Pablo',
      avatar: 'https://i.pravatar.cc/96?img=23',
      online: false,
      lastSeen: 'Conectado hace 5 minutos',
    },
    badges: ['cancelled'],
    messages: [
      {
        id: '1',
        role: 'me',
        type: 'text',
        text: '¡Gracias por confirmar el intercambio de Rayuela!',
        createdAt: '2025-02-20T10:00:00.000Z',
        displayTime: '10:00',
      },
      {
        id: '2',
        role: 'system',
        type: 'reminder',
        reminder: {
          message:
            'Recordatorio: hoy 18:00 en Plaza Dorrego (San Telmo) por Rayuela.',
          details: {
            location: {
              name: 'Plaza Dorrego',
              area: 'San Telmo, Buenos Aires',
              type: 'public',
            },
            schedule: {
              day: 'Viernes 21 de febrero',
              time: '18:00',
            },
            book: {
              title: 'Rayuela',
            },
          },
        },
        createdAt: '2025-02-21T08:00:00.000Z',
        displayTime: '08:00',
      },
      {
        id: '3',
        role: 'them',
        type: 'cancellation',
        cancellation: {
          reason:
            'Se me complicó llegar hoy, podemos reintentarlo la semana próxima.',
          details: {
            location: {
              name: 'Plaza Dorrego',
              area: 'San Telmo, Buenos Aires',
              type: 'public',
            },
            schedule: {
              day: 'Viernes 21 de febrero',
              time: '18:00',
            },
            book: {
              title: 'Rayuela',
            },
          },
        },
        createdAt: '2025-02-21T12:00:00.000Z',
        displayTime: '12:00',
      },
      {
        id: '4',
        role: 'system',
        type: 'text',
        text: 'El acuerdo quedó cancelado. Puedes enviar una nueva propuesta cuando quieras.',
        createdAt: '2025-02-21T12:01:00.000Z',
        displayTime: '12:01',
      },
    ],
  },
]
