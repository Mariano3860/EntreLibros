# Request Flows

## Login

`LoginPage` -> `api/auth/login.service.ts` -> `/api/auth/login` ->
`routes/auth.ts` -> `userRepository.ts` -> PostgreSQL -> cookie de sesión ->
`AuthContext`. Revisa `backend/tests/routes/auth.api.test.ts` y pruebas de
frontend para validar el flujo.

## Publish Book

`PublishBookModal` construye el payload -> `publishBook` -> rutas de libros ->
`createBookListing` -> `books`, `book_listings` e imágenes en una transacción.
React Query invalida los listados. Revisa `books.api.test.ts`, pruebas del modal
y `e2e/tests/publishing.spec.ts`.

## Search and Map

`MapPage` y `useMapData` consultan `/api/map`; `services/map.ts` aplica filtros
y PostGIS, y devuelve proyecciones públicas. `MapCanvas` muestra el resultado.
Revisa pruebas API/map y `e2e/tests/map.spec.ts`.

## Send Message and Agreement

`MessagesPage` guarda un draft y lo envía por HTTP. `sendDraftMessageCommand`
valida, persiste y luego publica el evento comprometido. Socket.IO entrega o
repite mensajes para participantes autorizados. Las rutas de acuerdos crean,
versionan y confirman propuestas; notificaciones reaccionan a eventos
persistidos. Revisa `messagingAgreement.e2e.test.ts`, socket y acuerdos.

## Profile Privacy

`ProfilePage` -> perfil API -> `routes/user.ts` -> `userRepository.ts`.
`toPublicUser` y perfiles públicos limitan identidad/ubicación según visibilidad.
Revisa `user.api.test.ts` y pruebas de seguridad.
