# Project Tour

Lee EntreLibros siguiendo este orden:

1. `frontend/src/App.tsx` instala React Query, autenticación, tema, idioma y el
   modo demo. `frontend/src/routes/index.tsx` conecta las páginas: libros,
   Comunidad, mapa, mensajes, perfil y estadísticas.
2. Para una publicación, sigue `PublishBookModal` -> cliente de
   `frontend/src/api/books` -> `backend/src/routes/books.ts` ->
   `bookListingRepository.ts` -> migraciones de libros/listings.
3. Para Rincones, sigue `MapPage.tsx` -> `useMapData.ts` -> `/api/map` ->
   `services/map.ts` -> PostGIS. Las coordenadas públicas se proyectan con
   menor precisión que las almacenadas.
4. Para un intercambio, sigue contacto desde libro/perfil -> borrador ->
   `POST /api/messages/:conversationId/draft/send` -> `messageCommand.ts` ->
   mensaje persistido -> Socket.IO -> acuerdo/notificación/outcome.
5. Para seguridad, sigue cookie de sesión -> `middleware/auth.ts` -> ruta ->
   comprobación de propietario/participante/bloqueo -> DTO público -> tests.

El modo `PUBLIC_API_USE_MOCKS=true` sirve una demo MSW, usando
`frontend/src/mocks/fixtures/experience.ts` y el estado acotado de
`frontend/src/contexts/mock/MockExperienceContext.tsx`; se reinicia al
recargar. No prueba persistencia, cookies ni Socket.IO real. Para la demo de
defensa usa el modo real y los recorridos de [Request Flows](request-flows.md).
