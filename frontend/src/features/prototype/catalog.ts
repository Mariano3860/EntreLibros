export type PrototypeBook = {
  id: string
  title: string
  author: string
  owner: string
  distance: string
  mode: 'Intercambio' | 'Venta' | 'Buscado'
  price?: string
  accent: string
  genre: string
}

export type PrototypeConversation = {
  id: string
  name: string
  initials: string
  preview: string
  time: string
  unread?: number
  online?: boolean
  accent: string
}

export type PrototypeChatMessage = {
  id: string
  role: 'me' | 'them'
  text: string
  time: string
  kind?: 'book' | 'proposal'
}

export const prototypeCatalog = {
  user: {
    id: 'mariano',
    name: 'Mariano',
    username: '@mariano',
    initials: 'M',
    city: 'Palermo · Buenos Aires',
    joined: 'Miembro desde marzo de 2023',
    bio: 'Lector curioso, coleccionista de historias y fan de encontrar nuevos rincones para leer.',
    interests: ['Ficción', 'Ciencia ficción', 'Poesía', 'Historia', 'Ensayo'],
  },
  books: [
    {
      id: 'ecos-viento-norte',
      title: 'Ecos del Viento Norte',
      author: 'Clara Montiel',
      owner: 'Lucia',
      distance: '800 m',
      mode: 'Intercambio',
      accent: '#e3785e',
      genre: 'Ficción',
    },
    {
      id: 'mapa-luciernagas',
      title: 'El mapa de las luciérnagas',
      author: 'Bruno Salvatierra',
      owner: 'Sofia',
      distance: '1,2 km',
      mode: 'Venta',
      price: '$12.500',
      accent: '#e9b85d',
      genre: 'Aventura',
    },
    {
      id: 'cartas-verano',
      title: 'Cartas para otro verano',
      author: 'Inés Robledo',
      owner: 'Diego',
      distance: '1,5 km',
      mode: 'Intercambio',
      accent: '#5d9ba1',
      genre: 'Romance',
    },
    {
      id: 'biblioteca-tiempo',
      title: 'La biblioteca sin tiempo',
      author: 'Tomás Valdés',
      owner: 'Ana',
      distance: '1,8 km',
      mode: 'Buscado',
      accent: '#8b75b9',
      genre: 'Fantasía',
    },
    {
      id: 'misma-constelacion',
      title: 'Bajo la misma constelación',
      author: 'Mara del Río',
      owner: 'Club de Lectura BA',
      distance: '2 km',
      mode: 'Venta',
      price: '$9.800',
      accent: '#416c91',
      genre: 'Contemporánea',
    },
  ] satisfies PrototypeBook[],
  homeKpis: [
    {
      icon: '↗',
      value: '134',
      label: 'libros intercambiados hoy',
      tone: 'teal',
    },
    { icon: '⌂', value: '52', label: 'casitas activas', tone: 'orange' },
    { icon: '◎', value: '1', label: 'intercambio en curso', tone: 'purple' },
    { icon: '✦', value: '1', label: 'nuevo mensaje', tone: 'blue' },
  ],
  activity: [
    {
      icon: '↔',
      title: 'Ofreciste “Ecos del Viento Norte”',
      meta: 'A Lucia · hace 12 min',
      tone: 'teal',
    },
    {
      icon: '♥',
      title: 'Guardaste “El mapa de las luciérnagas”',
      meta: 'Hace 38 min',
      tone: 'orange',
    },
    {
      icon: '✓',
      title: 'Completaste un intercambio con Sofia',
      meta: 'Ayer, 18:42',
      tone: 'purple',
    },
  ],
  stories: [
    { id: 'mine', name: 'Tu historia', initials: '+', accent: '#42d7c7' },
    { id: 'red-tea', name: 'Red tea', initials: 'RT', accent: '#d96d59' },
    { id: 'harry', name: 'Harry Potter', initials: 'HP', accent: '#8069b2' },
    { id: 'poetry', name: 'Club de poesía', initials: 'CP', accent: '#d9a85e' },
    { id: 'corner', name: 'Nueva casita', initials: 'NC', accent: '#5b98a1' },
    { id: 'ba', name: 'Lectores BA', initials: 'BA', accent: '#5078a5' },
    { id: 'fiction', name: 'Ficción total', initials: 'FT', accent: '#b36586' },
  ],
  communityPosts: [
    {
      id: 'lucia-reading-corner',
      author: 'Lucia Fernández',
      initials: 'L',
      accent: '#d96d59',
      online: true,
      meta: 'Hace 24 min · Palermo',
      text: 'Encontré el rincón perfecto para terminar un libro un domingo. ¿Alguien se suma la próxima? 📚',
      image: '/prototype/community-reading.svg',
      imageAlt: 'Una lectora disfrutando un libro en un rincón cálido',
      likes: '♥ 42 personas',
      comments: '8 comentarios',
    },
  ],
  conversations: [
    {
      id: 'bot',
      name: 'Bot',
      initials: 'B',
      preview: 'Consejos para intercambiar seguro',
      time: '12:08',
      accent: '#42d7c7',
    },
    {
      id: 'lucia',
      name: 'Lucia',
      initials: 'L',
      preview: '¡Me encanta la propuesta!',
      time: '11:46',
      unread: 2,
      online: true,
      accent: '#dd7b62',
    },
    {
      id: 'club',
      name: 'Club de Lectura BA',
      initials: 'CL',
      preview: 'Nos vemos el sábado',
      time: '10:20',
      unread: 4,
      accent: '#6e85b5',
    },
    {
      id: 'sofia',
      name: 'Sofia',
      initials: 'S',
      preview: 'Gracias por el intercambio',
      time: 'Ayer',
      accent: '#9a78aa',
    },
    {
      id: 'diego',
      name: 'Diego',
      initials: 'D',
      preview: '¿Te queda bien Palermo?',
      time: 'Ayer',
      accent: '#5c9b83',
    },
    {
      id: 'ana',
      name: 'Ana',
      initials: 'A',
      preview: 'Tengo otro libro para mostrarte',
      time: 'Lun',
      accent: '#d7a657',
    },
  ] satisfies PrototypeConversation[],
  chatMessages: [
    {
      id: 'm1',
      role: 'them',
      text: '¡Hola, Mariano! Vi que te interesa Ecos del Viento Norte.',
      time: '11:36',
    },
    {
      id: 'm2',
      role: 'me',
      text: 'Sí, me encantaría leerlo. Tengo uno que quizás te guste.',
      time: '11:39',
    },
    {
      id: 'm3',
      role: 'them',
      text: '¡Me encanta la propuesta! Podemos encontrarnos en Café Literario.',
      time: '11:46',
    },
    {
      id: 'm4',
      role: 'them',
      text: 'Propuesta de intercambio · Ecos del Viento Norte',
      time: '11:47',
      kind: 'proposal',
    },
  ] satisfies PrototypeChatMessage[],
  mapCategories: [
    'Todo',
    'Cafés',
    'Bibliotecas',
    'Parques',
    'Librerías',
    'Más',
  ],
  corners: [
    {
      id: 'cafe-literario',
      name: 'Café Literario',
      category: 'Café',
      distance: '450 m',
      activity: '12 lectores activos',
      x: 54,
      y: 52,
      tone: 'orange',
    },
    {
      id: 'biblioteca-palermo',
      name: 'Biblioteca de Palermo',
      category: 'Biblioteca',
      distance: '900 m',
      activity: '8 lectores activos',
      x: 72,
      y: 31,
      tone: 'purple',
    },
    {
      id: 'plaza-guemes',
      name: 'Plaza Güemes',
      category: 'Parque',
      distance: '1,3 km',
      activity: '5 lectores activos',
      x: 35,
      y: 67,
      tone: 'teal',
    },
  ],
  stats: {
    kpis: [
      {
        icon: '↔',
        value: '2.843',
        label: 'Intercambios',
        change: '+12,4%',
        tone: 'teal',
      },
      {
        icon: '▤',
        value: '1.327',
        label: 'Publicaciones',
        change: '+8,1%',
        tone: 'orange',
      },
      {
        icon: '♙',
        value: '5.891',
        label: 'Lectores activos',
        change: '+18,7%',
        tone: 'purple',
      },
      {
        icon: '⌂',
        value: '7.642',
        label: 'Visitas a rincones',
        change: '+6,5%',
        tone: 'blue',
      },
    ],
    weekly: [36, 48, 43, 66, 59, 84, 76],
    posts: [42, 58, 49, 72, 64, 89, 78],
    dayLabels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    shortDayLabels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    rankingVisits: [342, 286, 219],
    contributors: [
      { name: 'Lucia', initials: 'L', value: '184 aportes', accent: '#dd7b62' },
      { name: 'Sofia', initials: 'S', value: '161 aportes', accent: '#9a78aa' },
      { name: 'Diego', initials: 'D', value: '143 aportes', accent: '#5c9b83' },
      { name: 'Ana', initials: 'A', value: '119 aportes', accent: '#d7a657' },
    ],
  },
  profileMetrics: [
    { value: '146', label: 'Libros leídos' },
    { value: '23', label: 'Intercambios' },
    { value: '58', label: 'Seguidores' },
    { value: '41', label: 'Siguiendo' },
  ],
  profile: {
    preferences: [
      {
        icon: '♡',
        title: 'Géneros favoritos',
        text: 'Ficción, ciencia ficción y poesía contemporánea',
      },
      {
        icon: '▤',
        title: 'Formatos',
        text: 'Tapa blanda y ediciones ilustradas',
      },
      {
        icon: '↔',
        title: 'Intercambios',
        text: 'Hasta 5 km · encuentros en rincones verificados',
      },
      {
        icon: '⌂',
        title: 'Rincón favorito',
        text: 'Café Literario, Palermo',
      },
    ],
    achievements: [
      { icon: '✦', title: 'Explorador', text: 'Visitaste 10 rincones' },
      { icon: '↔', title: 'Buen vecino', text: '20 intercambios' },
      { icon: '☾', title: 'Noctámbulo', text: 'Leíste 5 noches seguidas' },
      { icon: '♥', title: 'Recomendador', text: '50 recomendaciones' },
    ],
    week: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    goal: { read: 23, target: 30, year: 2026 },
    streak: { current: 12, best: 28, completedDays: 6 },
  },
  helpCategories: [
    { icon: '♙', title: 'Cuenta', text: 'Perfil, privacidad y acceso' },
    { icon: '▤', title: 'Publicaciones', text: 'Publicá y administrá libros' },
    { icon: '↔', title: 'Intercambios', text: 'Propuestas y acuerdos' },
    { icon: '✉', title: 'Mensajes', text: 'Chats y notificaciones' },
    { icon: '⌂', title: 'Casitas', text: 'Rincones y comunidad' },
    { icon: '◇', title: 'Seguridad', text: 'Reportes y buenas prácticas' },
  ],
  faqs: [
    {
      id: 'publish',
      question: '¿Cómo publico un libro?',
      answer:
        'Desde Explorar elegí “Publicar un libro”, completá los datos y seleccioná si querés venderlo o intercambiarlo.',
    },
    {
      id: 'trade',
      question: '¿Cómo funciona un intercambio?',
      answer:
        'Enviá una propuesta desde un libro o un chat. Ambas personas deben aceptar lugar, fecha y libros antes de confirmarlo.',
    },
    {
      id: 'corner',
      question: '¿Qué es una casita o rincón?',
      answer:
        'Es un punto de encuentro de la comunidad: cafés, bibliotecas, parques y librerías donde podés leer o intercambiar.',
    },
    {
      id: 'safety',
      question: '¿Cómo reporto un problema?',
      answer:
        'Usá la opción Reportar en la publicación o escribinos desde el panel de soporte de esta página.',
    },
  ],
} as const

export type PrototypeCatalog = typeof prototypeCatalog
