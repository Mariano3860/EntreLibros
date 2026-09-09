# Change Map

| Quiero cambiar | Frontend | Backend / datos | Tests a revisar |
| --- | --- | --- | --- |
| Password o sesión | `RegisterForm`, auth API/context | `routes/auth.ts`, auth middleware, users | auth API, auth E2E |
| Perfil o datos públicos | `ProfilePage`, perfil API | `routes/user.ts`, `userRepository`, users/blocks | user API, security, profile E2E |
| Publicación o catálogo | `PublishBookModal`, `BooksPage` | books route, `bookListingRepository`, books/listings | books API, publishing/catalog E2E |
| Rincón o filtro de mapa | `MapPage`, MapCanvas, FilterRail | map/community routes, map/corner services, PostGIS | map API/performance, map E2E |
| Mensaje o draft | `MessagesPage`, draft/socket hooks | messages route, message command/repository, drafts | messaging repository/socket/E2E |
| Acuerdo | MessagesPage, agreements API | agreements route/repository, versions/outcomes | agreement concurrency and E2E |
| Notificación | bell/hooks | notifications service/repository | notification and messaging/agreement tests |
| Reporte o métrica | report/stats UI | reports/community routes, repositories | reports/community API |

## Exercises

- **Password mínima a 10:** empieza en `RegisterForm` y `routes/auth.ts`; revisa
  validación, i18n, auth API y E2E.
- **Nuevo estado de libro:** empieza en tipos de publicación, modal y books
  route; revisa restricciones de listings, catálogo y pruebas de publicación.
- **Filtro de Rincones:** empieza en FilterRail/MapPage y tipos de mapa; revisa
  parser de `/api/map`, PostGIS y pruebas map.
- **Nuevo tipo de notificación:** empieza en UI/tipos; revisa servicio,
  repository, idempotency key y pruebas de eventos.
- **Nuevo dato público de perfil:** empieza en DTO/UI; revisa proyección pública,
  privacidad/bloqueos y seguridad.
- **Nueva propiedad de acuerdo:** empieza en tipos/UI; revisa validación de ruta,
  versiones, transacción, historial y E2E.
