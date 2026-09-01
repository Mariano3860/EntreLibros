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

En una propuesta pendiente, quien la envió solo puede cancelarla; la contraparte puede aceptarla o rechazarla, y el backend aplica la misma regla para confirmar o rechazar la versión vigente.

## Bot

El bot persistente aparece con identidad “Bot”, no como “Conversación 1”. La migración `015_seed_messaging_bot.sql` crea su usuario y el repositorio garantiza una conversación por usuario. El canal global legacy puede responder con el identificador histórico `0`, pero no es el flujo persistido.

## Modo mock

Con `PUBLIC_API_USE_MOCKS=true`, MSW sirve respuestas de demostración y el bot mock puede responder para verificar la UI. Ese modo no demuestra persistencia PostgreSQL. Para validar almacenamiento, usa `false`, ejecuta migraciones y comprueba `GET /api/messages` después de recargar.
