# Mensajería: interfaz y contrato

## Burbujas

La UI distingue mensajes propios y recibidos mediante el autor, no mediante el texto. Un mensaje enviado puede estar en estado pendiente, confirmado o fallido; los estados visuales deben seguir las traducciones existentes y no inventar errores visibles.

## Flujo real

1. El cliente carga conversaciones con `GET /api/messages`.
2. El usuario abre una conversación y se une a su sala Socket.IO.
3. `conversation:message` se valida y persiste en backend.
4. El servidor emite el mensaje confirmado.
5. La respuesta del bot se persiste antes de emitirla.
6. Tras reconectar, el cliente vuelve a cargar historial y reconcilia mensajes pendientes usando su clave de cliente.

## Adjuntos e intercambios

Los mensajes pueden conservar un adjunto tipado en `attachment_metadata` sin introducir otra tabla. El backend acepta tres variantes:

- `book`: referencia a una publicación disponible, con título, autor, portada y propietario.
- `swap`: libro ofrecido por quien envía y libro solicitado de la contraparte, con nota opcional.
- `agreement`: propuesta, contrapropuesta o evento del acuerdo, con versión, libros involucrados, datos del encuentro y actor.

Cada adjunto se valida contra los participantes de la conversación, el estado de las publicaciones, el propietario real de cada listing y la pertenencia del acuerdo. Las rutas HTTP de mensajes y acuerdos publican el evento persistido por Socket.IO, por lo que los adjuntos y las propuestas se reconstruyen al recargar el historial. Los reintentos con el mismo `clientKey` devuelven el mensaje ya persistido sin volver a emitirlo ni generar notificaciones duplicadas. El menú `+` del compositor permite insertar un emoji en el borrador, adjuntar un libro propio o de la contraparte, proponer un intercambio con ambos catálogos o preparar un acuerdo.

## Contactos y no leídos

El diálogo de nueva conversación consulta `GET /api/messages/contacts?search=` y busca por nombre, apellido o alias. La respuesta prioriza a las personas seguidas y no incluye al usuario autenticado, perfiles privados ni relaciones bloqueadas. Si ya existe una conversación directa, la selección la abre; de lo contrario, `POST /api/messages/conversations` crea una nueva.

Cada resumen de conversación incluye `unreadCount`, calculado desde el cursor de lectura del participante y contando solo mensajes enviados por la otra persona. La pestaña “No leídos” usa ese valor y muestra un estado vacío explícito cuando no hay conversaciones pendientes.

En una propuesta pendiente, quien la envió solo puede cancelarla; la contraparte puede aceptarla o rechazarla, y el backend aplica la misma regla para confirmar o rechazar la versión vigente.

Si la conversación ya tiene un acuerdo vigente en estado `proposed` o `partially_confirmed`, "Preparar acuerdo" recupera sus datos y envía una contraoferta mediante una nueva versión del mismo acuerdo. No intenta crear un segundo registro para la conversación, ya que el modelo admite un acuerdo por conversación; el libro queda vinculado a los listings de la versión anterior.

La validacion del destinatario y la idempotencia de `POST /api/messages/conversations` tambien se aplican en el backend: no se pueden abrir conversaciones con perfiles privados, bots, usuarios inexistentes o relaciones bloqueadas, y dos solicitudes concurrentes del mismo par devuelven una sola conversacion. Los eventos entrantes invalidan el listado y el chat seleccionado marca como leido el mensaje en vivo, por lo que la insignia y el filtro de no leidos no quedan obsoletos.

## Bot

El bot persistente aparece con identidad “Bot”, no como “Conversación 1”. La migración `015_seed_messaging_bot.sql` crea su usuario y el repositorio garantiza una conversación por usuario. El canal global legacy puede responder con el identificador histórico `0`, pero no es el flujo persistido.

## Modo mock

Con `PUBLIC_API_USE_MOCKS=true`, MSW sirve respuestas de demostración y el bot mock puede responder para verificar la UI. Ese modo no demuestra persistencia PostgreSQL. Para validar almacenamiento, usa `false`, ejecuta migraciones y comprueba `GET /api/messages` después de recargar.
