# Database

PostgreSQL es la persistencia y PostGIS permite proximidad, radio, bbox y
proyecciones geográficas.

## Baseline y ciclo de migraciones

Los cuatro archivos iniciales de `backend/migrations/` instalan el modelo final
completo en una base PostgreSQL/PostGIS nueva y vacía. Están separados para
poder recorrerse en orden: `001_schema_objects.sql` crea extensiones, tipos,
tablas y secuencias; `002_defaults_and_constraints.sql` completa defaults y
constraints locales; `003_indexes.sql` añade los índices; y
`004_foreign_keys.sql` establece las relaciones entre tablas. Son DDL
exclusivamente: no insertan usuarios, libros, conversaciones ni contenido de
demostración. El migrador normaliza LF para mantener hashes estables y puede
ejecutarse de nuevo sin duplicar objetos.

El baseline no actualiza una base que tenga el ledger histórico `001`–`037`.
El runner la rechaza antes de aplicar DDL; conserva esa base y su `DATABASE_URL`
como rollback, y crea otra base aprobada para el baseline. Después del baseline,
cualquier cambio vuelve a ser una migración numerada nueva y append-only.

El bot operativo se crea con el bootstrap de system data y el recorrido de
defensa con `seed:local`; ninguno pertenece a las migraciones. Para comparar un
build histórico limpio y una base baseline, usa `npm run schema:compare -w
backend` con `SCHEMA_REFERENCE_DATABASE_URL` y
`SCHEMA_CANDIDATE_DATABASE_URL`.

Familias principales: `users` y bloqueos; `books` y `book_listings`; Rincones;
conversaciones, participantes, mensajes y borradores; acuerdos/versiones/items/
outcomes; Comunidad; notificaciones; reportes; analítica. Los repositories son
la guía para saber quién escribe cada familia: `userRepository`,
`bookListingRepository`, `communityCornerRepository`, `messagingRepository`,
`agreementRepository`, `notificationRepository`, `reportRepository` y
`analyticsRepository`.

`withTransaction` en `backend/src/db.ts` protege escrituras compuestas. Migra y
prueba siempre una base aislada; no documentes dumps, secretos ni datos reales.
