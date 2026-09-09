# Mensajería y acuerdos

## Flujo real

1. El cliente carga conversaciones con `GET /api/messages`.
2. Al abrir una conversación se une a su sala de Socket.IO.
3. La interfaz productiva envía el borrador con `POST /api/messages/:conversationId/draft/send`; el comando canónico valida, persiste, crea los efectos y publica el resultado una sola vez.
4. Socket.IO entrega `conversation:message` y permite `conversation:join` con cursor para el replay; el cliente invalida y recarga el historial tras reconectar.

Socket.IO no acepta comandos de escritura: autentica la sesión, autoriza las
salas y entrega los eventos de mensajes y acuerdos ya persistidos.

La mensajería real necesita sesión, migraciones aplicadas y backend activo. El bot persistente se crea con `015_seed_messaging_bot.sql`; cuando una conversación autorizada lo incluye, el mismo comando canónico persiste, notifica y entrega su respuesta.

## Adjuntos y acuerdos

Los mensajes pueden incluir metadata tipada para:

- `book`: publicación disponible con título, autor, portada y propietario.
- `swap`: libro ofrecido, libro solicitado y nota opcional.
- `agreement`: propuesta o evento del acuerdo con versión, libros y datos del encuentro.

El backend comprueba participantes, propietarios, disponibilidad y pertenencia del acuerdo. Las propuestas y contraofertas se conservan en el historial, y no se crea un segundo acuerdo para la misma conversación.

## Borradores enriquecidos

`GET`, `PUT` y `DELETE /api/messages/:conversationId/draft` gestionan un único borrador privado por autor y conversación. El borrador puede contener texto, un libro, un intercambio o una propuesta de acuerdo; se guarda con revisión para detectar ediciones obsoletas y se conserva al recargar la sesión.

`POST /api/messages/:conversationId/draft/send` valida nuevamente el contenido, crea el acuerdo cuando corresponde, persiste un único mensaje normal y elimina el borrador en la misma transacción. Hasta ese momento no aparece en el historial, no incrementa no leídos ni envía notificaciones. Contactar desde una publicación crea una conversación silenciosa y guarda el texto inicial junto con el libro como borrador.

## Protocolo de envío y realtime

El envío soportado es HTTP: `POST /api/messages/:conversationId/messages` para el contrato API y `POST /api/messages/:conversationId/draft/send` para la interfaz productiva. Ambos terminan en el mismo comando de mensajería: la persistencia conserva `clientKey` para idempotencia y, solo si el resultado es nuevo, crea analítica aplicable, notificaciones y el evento interno de entrega.

`conversation:join` con cursor repite los mensajes persistidos posteriores al cursor. Tras recibir `conversation:message` o `agreement:updated`, el cliente invalida historial, conversaciones y notificaciones; el estado leído continúa usando su ruta HTTP. Los acuerdos y borradores conservan sus transacciones y revisiones actuales; los borradores no se entregan ni notifican hasta enviarse.

## Contactos y no leídos

`GET /api/messages/contacts?search=` busca personas públicas por nombre o alias, prioriza contactos seguidos y excluye al usuario actual y relaciones bloqueadas. `POST /api/messages/conversations` vuelve a validar visibilidad, existencia y bloqueos en el servidor.

Cada conversación expone `unreadCount` para mensajes entrantes. La pestaña «No leídos», el punto rojo del sidebar y las notificaciones utilizan ese estado. Al abrir la conversación se actualiza el cursor de lectura y se marcan los avisos relacionados como leídos.

## Modo demo

Con `PUBLIC_API_USE_MOCKS=true`, MSW permite revisar la UI y respuestas de ejemplo, pero no prueba PostgreSQL, autorización ni persistencia después de recargar. Para validar el flujo real usa `false` u omite la variable.
