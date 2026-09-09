export const helpCategories = [
  { icon: '♙', title: 'Cuenta', text: 'Perfil, privacidad y acceso' },
  { icon: '▤', title: 'Publicaciones', text: 'Publicá y administrá libros' },
  { icon: '↔', title: 'Intercambios', text: 'Propuestas y acuerdos' },
  { icon: '✉', title: 'Mensajes', text: 'Chats y notificaciones' },
  { icon: '⌂', title: 'Casitas', text: 'Rincones y comunidad' },
  { icon: '◇', title: 'Seguridad', text: 'Reportes y buenas prácticas' },
] as const

export const faqs = [
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
] as const
