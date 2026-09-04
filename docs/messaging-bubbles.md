# Mensajería y acuerdos

## Flujo real

1. El cliente carga conversaciones con `GET /api/messages`.
2. Al abrir una conversación se une a su sala de Socket.IO.
3. `conversation:message` valida autorización, persiste el mensaje y luego lo emite.
4. El cliente reconcilia reintentos mediante `clientKey` y vuelve a cargar el historial después de reconectar.

La mensajería real necesita sesión, migraciones aplicadas y backend activo. El bot persistente se crea con `015_seed_messaging_bot.sql`; el canal global antiguo se mantiene únicamente por compatibilidad.

## Adjuntos y acuerdos

Los mensajes pueden incluir metadata tipada para:

- `book`: publicación disponible con título, autor, portada y propietario.
- `swap`: libro ofrecido, libro solicitado y nota opcional.
- `agreement`: propuesta o evento del acuerdo con versión, libros y datos del encuentro.

El backend comprueba participantes, propietarios, disponibilidad y pertenencia del acuerdo. Las propuestas y contraofertas se conservan en el historial, y no se crea un segundo acuerdo para la misma conversación.

## Borradores enriquecidos

`GET`, `PUT` y `DELETE /api/messages/:conversationId/draft` gestionan un único borrador privado por autor y conversación. El borrador puede contener texto, un libro, un intercambio o una propuesta de acuerdo; se guarda con revisión para detectar ediciones obsoletas y se conserva al recargar la sesión.

`POST /api/messages/:conversationId/draft/send` valida nuevamente el contenido, crea el acuerdo cuando corresponde, persiste un único mensaje normal y elimina el borrador en la misma transacción. Hasta ese momento no aparece en el historial, no incrementa no leídos ni envía notificaciones. Contactar desde una publicación crea una conversación silenciosa y guarda el texto inicial junto con el libro como borrador.

## Contactos y no leídos

`GET /api/messages/contacts?search=` busca personas públicas por nombre o alias, prioriza contactos seguidos y excluye al usuario actual y relaciones bloqueadas. `POST /api/messages/conversations` vuelve a validar visibilidad, existencia y bloqueos en el servidor.

Cada conversación expone `unreadCount` para mensajes entrantes. La pestaña «No leídos», el punto rojo del sidebar y las notificaciones utilizan ese estado. Al abrir la conversación se actualiza el cursor de lectura y se marcan los avisos relacionados como leídos.

## Modo demo

Con `PUBLIC_API_USE_MOCKS=true`, MSW permite revisar la UI y respuestas de ejemplo, pero no prueba PostgreSQL, autorización ni persistencia después de recargar. Para validar el flujo real usa `false` u omite la variable.
