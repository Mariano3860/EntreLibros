# Database

PostgreSQL es la persistencia y PostGIS permite proximidad, radio, bbox y
proyecciones geográficas. `backend/migrations/001_init.sql` a
`035_create_message_drafts.sql` se aplican en orden: una migración aplicada no
se edita; una corrección se agrega con un número nuevo.

Familias principales: `users` y bloqueos; `books` y `book_listings`; Rincones;
conversaciones, participantes, mensajes y borradores; acuerdos/versiones/items/
outcomes; Comunidad; notificaciones; reportes; analítica. Los repositories son
la guía para saber quién escribe cada familia: `userRepository`,
`bookListingRepository`, `communityCornerRepository`, `messagingRepository`,
`agreementRepository`, `notificationRepository`, `reportRepository` y
`analyticsRepository`.

`withTransaction` en `backend/src/db.ts` protege escrituras compuestas. Migra y
prueba siempre una base aislada; no documentes dumps, secretos ni datos reales.
