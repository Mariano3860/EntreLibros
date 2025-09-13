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
        sender: 'them',
        text: "I'll trade it for your book",
        time: '4:30 PM',
      },
      {
        id: 2,
        sender: 'me',
        text: "Hi! I'm interested in To Kill a Mockingbird",
        time: '4:32 PM',
      },
      {
        id: 3,
        sender: 'them',
        text: 'Sure! Are you offering a book for exchange?',
        time: '4:35 PM',
      },
      {
        id: 4,
        sender: 'me',
        text: "I'll trade it for your book",
        book: {
          title: 'The Wind-Up Bird Chronicle',
          author: 'Haruki Murakami',
          cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg',
        },
        time: '4:37 PM',
      },
      {
        id: 5,
        sender: 'them',
        text: 'Sounds good!',
        time: '4:37 PM',
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
        sender: 'them',
        text: 'Great, thanks!',
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
        sender: 'them',
        text: 'Swap request pending',
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
        sender: 'them',
        text: 'Whoa, sounds like a great book!',
        time: 'Yesterday',
      },
    ],
  },
]
