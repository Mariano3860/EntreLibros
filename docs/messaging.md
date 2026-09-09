# Messaging

HTTP es el command path canónico: el usuario guarda un borrador con
`GET|PUT|DELETE /api/messages/:conversationId/draft` y lo confirma con
`POST /api/messages/:conversationId/draft/send`. `messageCommand.ts` persiste
el mensaje antes de notificar o emitir eventos.

Socket.IO no crea mensajes. `conversation:join` valida al participante, abre la
room y permite replay posterior al cursor; `conversation:read` avanza el cursor.
`conversation:message` y `agreement:updated` distribuyen hechos ya persistidos.

Un draft tiene revisión y es privado: no pertenece al historial, no incrementa
unread ni crea notificaciones hasta enviarse. `clientKey` evita duplicados.
Los acuerdos son versionados; aceptar una versión antigua no confirma la actual.
El bot, si participa, usa la misma operación canónica de persistencia.

Puntos de lectura: `MessagesPage.tsx`, `useMessageDraft.ts`,
`useChatSocket.ts`, `routes/messages.ts`, `services/messageCommand.ts`,
`repositories/messagingRepository.ts`, `socket.ts` y pruebas E2E de mensajería.
