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

## Bot

El bot persistente aparece con identidad “Bot”, no como “Conversación 1”. La migración `015_seed_messaging_bot.sql` crea su usuario y el repositorio garantiza una conversación por usuario. El canal global legacy puede responder con el identificador histórico `0`, pero no es el flujo persistido.

## Modo mock

Con `PUBLIC_API_USE_MOCKS=true`, MSW sirve respuestas de demostración y el bot mock puede responder para verificar la UI. Ese modo no demuestra persistencia PostgreSQL. Para validar almacenamiento, usa `false`, ejecuta migraciones y comprueba `GET /api/messages` después de recargar.
