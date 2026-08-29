# Línea base de recuperación de EntreLibros

> **Nota de vigencia (2026-08-29):** este documento conserva la línea base histórica de la recuperación y de PR #138. Para el comportamiento actual consulta [`estado-actual.md`](estado-actual.md), [`arquitectura.md`](arquitectura.md) y [`troubleshooting.md`](troubleshooting.md). La semilla del bot y la persistencia de su conversación pertenecen a una etapa posterior.

Capturada el 2026-08-28 a las 13:14 CEST para el cambio OpenSpec
`complete-entrelibros-recovery`. Los comandos están escritos para PowerShell
desde la raíz del repositorio, salvo que se indique lo contrario.

## Línea base de Git

| Elemento | Valor capturado |
| --- | --- |
| Rama actual | `main` |
| `HEAD` local | `f87df5d1f97f122878ceeb105bb973681536457a` |
| `origin/main` en caché local | `f87df5d1f97f122878ceeb105bb973681536457a` |
| `main` remoto actual | `c06a37ea45f2aa1b19c98f88d43a79bb3a6eea34` |
| HEAD de la PR #138 | `5dc3bf397ff51e9c4280b6fbf3667f7d04d53944` |
| Snapshot base de la PR #138 | `f87df5d1f97f122878ceeb105bb973681536457a` |

La rama local estaba atrasada respecto del remoto. Durante la captura no se
ejecutaron fetch, merge, rebase, checkout ni creación de ramas.

```powershell
git log -1 --format='local_head=%H%nlocal_subject=%s%nlocal_date=%cI'
git branch -avv
git ls-remote origin refs/heads/main refs/pull/138/head
```

El árbol de trabajo contenía el cambio OpenSpec preparado y sus skills locales.
Siete rutas del backend aparecían inicialmente como modificadas sin stage,
aunque `git diff` estaba vacío. Era una entrada obsoleta de saltos de línea y
estadísticas en el índice: el índice registraba archivos CRLF antiguos, pero
los archivos LF actuales eran idénticos byte a byte a `HEAD`.

Para cada ruta afectada, `HEAD`, el índice, el árbol sin filtros y el árbol
filtrado por Git resolvían al mismo blob. Después se agregaron explícitamente
esas rutas para refrescar solo los metadatos del índice. Los diffs preparado y
no preparado siguen vacíos, y `git status --short` muestra únicamente las
adiciones intencionales de recuperación/OpenSpec. No se reescribió ningún
archivo del backend.

Affected paths:

- `backend/openapi.json`
- `backend/src/repositories/bookListingRepository.ts`
- `backend/src/routes/books.ts`
- `backend/src/routes/contact.ts`
- `backend/src/services/bookListings.ts`
- `backend/tests/routes/books.api.test.ts`
- `backend/tests/routes/contact.api.test.ts`

```powershell
$paths = @(
  'backend/openapi.json',
  'backend/src/repositories/bookListingRepository.ts',
  'backend/src/routes/books.ts',
  'backend/src/routes/contact.ts',
  'backend/src/services/bookListings.ts',
  'backend/tests/routes/books.api.test.ts',
  'backend/tests/routes/contact.api.test.ts'
)
foreach ($path in $paths) {
  git rev-parse "HEAD:$path"
  git rev-parse ":$path"
  git hash-object --no-filters -- $path
  git hash-object --path=$path -- $path
}
git diff --exit-code -- $paths
git diff --cached --exit-code -- $paths
git status --short
```

## PR #138 y CI

[PR #138, "Implement agreement version workflow"](https://github.com/Mariano3860/EntreLibros/pull/138)
está abierta y no es un borrador. GitHub la informa como integrable pero
bloqueada. Apunta a `main` desde
`feature/expand-messages.types.ts-for-agreementversion`, tiene un commit y no
cuenta con una aprobación de revisión.

Quedaban seis hilos de revisión sin resolver:

| Path | Finding | Thread |
| --- | --- | --- |
| `frontend/src/components/messages/useAgreementStore.ts` | Unused cancellation `reason` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522113) |
| `frontend/src/components/messages/useAgreementStore.ts` | `confirmVersion` reads stale closure state | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522157) |
| `frontend/src/components/messages/useAgreementStore.ts` | `cancelVersion` reads stale closure state | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522188) |
| `frontend/src/components/messages/useAgreementStore.ts` | Redundant `useMemo` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522210) |
| `frontend/src/components/messages/Messages.tsx` | Duplicate agreement lookup | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522221) |
| `frontend/src/components/messages/useAgreementStore.ts` | P1 concurrent updates must derive from `prev` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491534939) |

### Inventario de recuperación de la PR #138 (2026-08-28)

El diff de la PR estaba limitado al flujo de acuerdos del frontend: tipos de
versión, store local de acuerdos, burbujas y modales de propuesta,
confirmación y cancelación, renderizado de mensajes, comprobación mock de
disponibilidad de libros y etiquetas en español/inglés. Las correcciones de
revisión se relacionaban así:

| Hallazgo de revisión | Cambio de código | Evidencia de regresión |
| --- | --- | --- |
| Confirmation/cancellation used a stale closure | Functional state updaters derive from `prev[conversationId]` | `frontend/tests/hooks/useAgreementStore.test.ts`: queued confirmations and cancellations |
| Unused cancellation reason | Removed the unused store parameter; the rendered message remains responsible for its display reason | Frontend typecheck plus existing cancellation rendering path |
| Redundant memoization | Return `agreements` directly from the hook | Frontend typecheck |
| Duplicate agreement lookup | The action path keeps one lookup for the selected conversation/version before appending the event | Frontend typecheck and PR diff review |

La PR todavía no contiene conversaciones, mensajes ni acuerdos persistentes,
rutas/migraciones de backend, cambios de entorno, actualizaciones generales de
dependencias ni trabajo de despliegue de producción. Todo eso se difiere
explícitamente a las secciones posteriores de
`complete-entrelibros-recovery` y no debe agregarse a #138.

El inventario de alcance de las rutas revisadas es:

| Área | Estado actual de la PR | Límite del seguimiento |
| --- | --- | --- |
| Conversation initialization | `Messages.tsx` initializes the current mock conversation list locally | Server conversation listing belongs to section 6 |
| Agreement versions | `useAgreementStore` keeps proposal history and active version in client state | Immutable persisted versions belong to section 5 |
| Confirm and cancel | Client-only transitions now use atomic functional updates; cancellation text stays in the message model | Authenticated commands and concurrency belong to section 5 |
| Reconnect | Existing Socket.IO chat path remains a transport/mock concern; no agreement recovery cursor exists | Persisted replay belongs to sections 4 and 6 |
| Errors | Current UI maps local store errors to i18n keys; no backend error contract is present | REST/OpenAPI error contracts belong to sections 4–6 |

La última [ejecución de CI del frontend](https://github.com/Mariano3860/EntreLibros/actions/runs/19077745239)
terminó con fallo en el job `quality`. La comprobación de auto-merge de
Dependabot fue omitida. GitHub ya no conserva el log del job fallido: al
solicitarlo el 2026-08-28 devolvió HTTP 410, por lo que la aserción histórica
exacta debía reproducirse en la rama de la PR, no inferirse.

```powershell
gh pr view 138 --repo Mariano3860/EntreLibros --json number,title,state,url,isDraft,baseRefName,baseRefOid,headRefName,headRefOid,author,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,updatedAt,commits,reviews
gh api graphql -F owner=Mariano3860 -F name=EntreLibros -F number=138 -f query='query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100){totalCount nodes{id isResolved isOutdated path line comments(first:20){nodes{id url author{login} body createdAt}}}}}}}'
gh run view 19077745239 --repo Mariano3860/EntreLibros --json databaseId,name,displayTitle,status,conclusion,url,createdAt,updatedAt,event,headBranch,headSha,jobs
gh run view 19077745239 --repo Mariano3860/EntreLibros --log-failed
```

## Esquema de base de datos y verificación de restauración

El contenedor fuente `entrelibros-db-1` usa el volumen
`entrelibros_db_data` y publica PostgreSQL en el puerto 5432 del host. Informa
PostgreSQL 16.4 y PostGIS 3.4.3. La base `entrelibros` contiene las
migraciones `001` a `009`; la tabla `migrations` tiene diez registros,
incluida la fila `0`, que crea la propia tabla de migraciones.

Se exportó un backup en formato custom al directorio temporal configurado por
PowerShell:

`$env:TEMP\EntreLibros-Recovery\entrelibros-20260828.dump`

SHA-256:
`4CD59F56722D4CA052DC1CE7B63F5A1FE7EE46A9E57C9C2BE97AF30D419D93E4`.

El dump se restauró con `pg_restore --exit-on-error` en la base
`entrelibros_restore_verify`, dentro del contenedor
`entrelibros-recovery-verify-20260828`. Ese contenedor usa el volumen separado
`entrelibros_recovery_verify_20260828`, modo de red `none` y no publica puertos.
El contenedor y el volumen fuente no se detuvieron, recrearon ni eliminaron.

Las cantidades exactas de filas de origen y restauración coinciden:

| Tabla | Filas |
| --- | ---: |
| `book_listing_images` | 4 |
| `book_listings` | 4 |
| `books` | 4 |
| `community_corner_metrics` | 2 |
| `community_corner_photos` | 2 |
| `community_corners` | 2 |
| `contact_messages` | 3 |
| `migrations` | 10 |
| `spatial_ref_sys` | 8500 |
| `users` | 4 |

Los diez IDs, nombres y hashes de migración coinciden, y ambas bases informan
PostGIS 3.4.3.

```powershell
docker exec entrelibros-db-1 pg_dump -U postgres -d entrelibros -Fc -f /tmp/entrelibros-20260828.dump
docker exec entrelibros-db-1 sha256sum /tmp/entrelibros-20260828.dump
$dumpDir = Join-Path $env:TEMP 'EntreLibros-Recovery'
$dumpPath = Join-Path $dumpDir 'entrelibros-20260828.dump'
New-Item -ItemType Directory -Force -Path $dumpDir | Out-Null
docker cp entrelibros-db-1:/tmp/entrelibros-20260828.dump $dumpPath
docker volume create entrelibros_recovery_verify_20260828
docker run -d --name entrelibros-recovery-verify-20260828 --network none -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=entrelibros_restore_verify -v entrelibros_recovery_verify_20260828:/var/lib/postgresql/data postgis/postgis:16-3.4
docker cp $dumpPath entrelibros-recovery-verify-20260828:/tmp/entrelibros-20260828.dump
docker exec entrelibros-recovery-verify-20260828 pg_restore -U postgres -d entrelibros_restore_verify --no-owner --no-privileges --exit-on-error /tmp/entrelibros-20260828.dump
docker inspect entrelibros-db-1 --format 'source ports={{json .NetworkSettings.Ports}} mounts={{range .Mounts}}{{.Name}}:{{.Destination}} {{end}}'
docker inspect entrelibros-recovery-verify-20260828 --format 'restore network={{.HostConfig.NetworkMode}} ports={{json .NetworkSettings.Ports}} mounts={{range .Mounts}}{{.Name}}:{{.Destination}} {{end}}'
$rowSql = "SELECT 'book_listing_images',count(*) FROM book_listing_images UNION ALL SELECT 'book_listings',count(*) FROM book_listings UNION ALL SELECT 'books',count(*) FROM books UNION ALL SELECT 'community_corner_metrics',count(*) FROM community_corner_metrics UNION ALL SELECT 'community_corner_photos',count(*) FROM community_corner_photos UNION ALL SELECT 'community_corners',count(*) FROM community_corners UNION ALL SELECT 'contact_messages',count(*) FROM contact_messages UNION ALL SELECT 'migrations',count(*) FROM migrations UNION ALL SELECT 'spatial_ref_sys',count(*) FROM spatial_ref_sys UNION ALL SELECT 'users',count(*) FROM users ORDER BY 1"
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -AtF '=' -c $rowSql
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -AtF '=' -c $rowSql
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -c 'TABLE migrations;'
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -c 'TABLE migrations;'
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -Atc "SELECT extversion FROM pg_extension WHERE extname='postgis'"
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -Atc "SELECT extversion FROM pg_extension WHERE extname='postgis'"
Get-FileHash -Algorithm SHA256 -LiteralPath $dumpPath
```

## Auditoría de dependencias de producción

`npm audit --omit=dev --json`, ejecutado sobre el lockfile raíz con Node
22.19.0 el 2026-08-28, informó 21 vulnerabilidades de producción: 15 altas,
6 moderadas, 0 bajas y 0 críticas. Todas indicaban que había una corrección
disponible.

Los paquetes directos afectados eran `axios` (alta), `express` (alta),
`lodash` (alta), `morgan` (moderada), `react-router-dom` (alta) y `validator`
(alta). Los transitivos eran `body-parser`, `brace-expansion`, `engine.io`,
`engine.io-client`, `follow-redirects`, `form-data`, `js-yaml`, `jws`,
`minimatch`, `path-to-regexp`, `qs`, `react-router`, `socket.io-adapter`,
`socket.io-parser` y `ws`. Esto es un inventario, no un análisis de alcance;
la tarea 8.1 debía clasificar la aplicabilidad en runtime antes de actualizar
o aceptar excepciones.

```powershell
docker run --rm -v 'C:\REPOS\EntreLibros:/workspace:ro' -w /workspace node:22.19.0-bookworm-slim npm audit --omit=dev --json
```

## Evidencia de migraciones y calidad de la PR #138

El 2026-08-28 la ejecución de migraciones se verificó dos veces contra el
esquema preservado `entrelibros_test` y contra la base aislada
`entrelibros_recovery_verify_20260828`. La rama de la PR incluye las
migraciones 010 a 014, con persistencia de conversaciones/acuerdos, reservas
de publicaciones y bloqueos bilaterales. El flujo E2E contra el servicio real
se ejecutó sobre PostgreSQL/PostGIS con mocks desactivados y cubrió dos
usuarios, recuperación por cursor, contrapropuesta, conflicto obsoleto,
confirmación bilateral y cancelación.
La restauración anonimizada anterior sigue siendo la línea base del esquema
preservado; las migraciones nuevas son append-only y se aplicaron al esquema
de test actual sin cambiar filas existentes.

La suite local del backend pasó con 27 archivos y 103 tests. La suite del
frontend pasó con cobertura habilitada. Las comprobaciones remotas de la PR
para el head `8aa3f10` pasaron tanto en backend como en frontend, y la revisión
final del diff encontró únicamente mensajería, acuerdos, sus tests,
documentación y el cambio de umbral de cobertura relacionado explícitamente.

La superficie de control del navegador no estaba disponible en ese entorno,
por lo que no podía afirmarse una ejecución E2E de navegador. La evidencia E2E
de servicio anterior es independiente de esa limitación; la suite existente
del frontend sigue siendo la evidencia automatizada de UI.

Los commits de recuperación de la PR #138 no cambiaron dependencias de runtime.
La auditoría informó 21 hallazgos de producción preexistentes (15 altos, 6
moderados, 0 críticos) con correcciones disponibles; quedaron registrados como
seguimiento explícito de la tarea 8.1 y no se aceptaron silenciosamente como
resueltos por esta PR.

## Puertas de entrega

| Puerta | Criterios de entrada | Evidencia de salida | Autoridad para merge |
| --- | --- | --- | --- |
| Base de runtime | Baseline y restauración verificados; el trabajo sigue aislado de la PR #138 | Pasan Node/configuración/proxy/PostGIS/migraciones y las comprobaciones del repositorio; el agente prepara la PR e informa rollback | Solo el usuario hace el merge; el agente espera confirmación |
| Recuperación de la PR #138 | El usuario confirma que la base de runtime está mergeada y la rama existente está actualizada | Hilos mapeados y resueltos; persistencia pasa migraciones, concurrencia, reconexión, E2E y CI; el agente actualiza la PR existente | Solo el usuario hace el merge; el agente espera confirmación |
| Producto y seguridad | El usuario confirma el merge de la PR #138 | PRs por capacidad pasan autorización, dependencias, contratos, migraciones y puertas generales; el agente prepara cada PR | Solo el usuario hace cada merge; el agente espera en cada límite |
| Producción y operación | Modelos y proveedores de producto/seguridad estables | Pasan imágenes, rutas, secretos, migraciones, salud, backup/restauración, rollback, observabilidad y E2E de producción | Solo el usuario aprueba y hace merge/despliegue; el agente no lo hace automáticamente |

Estas puertas controlan la entrega. Una comprobación local en verde no autoriza
al agente a hacer merge de una PR ni a desplegar una versión.
