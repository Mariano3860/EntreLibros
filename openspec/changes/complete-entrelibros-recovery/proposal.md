## Why

EntreLibros tiene un núcleo funcional que compila y pasa sus pruebas, pero hoy no ofrece un camino reproducible desde un clon limpio hasta un despliegue seguro: la configuración local entra en conflicto, producción no está cableada correctamente y varias capacidades visibles todavía dependen de mocks o estado sólo del cliente. Este cambio convierte el estado actual y el trabajo abierto de la PR #138 en un programa verificable para terminar un MVP desplegable, mantenible y documentado.

## What Changes

- Establecer un único flujo de desarrollo reproducible para Node.js, PostgreSQL/PostGIS, migraciones, variables de entorno, frontend y backend, incluyendo detección clara de conflictos de puertos y servicios locales.
- **BREAKING**: normalizar los contratos de configuración y despliegue (`PUBLIC_API_BASE_URL`, URLs con `/api`, puertos, `NODE_ENV`, nombres de secretos y versión de Node), eliminando variantes contradictorias.
- Construir un despliegue de producción reproducible con imágenes locales/versionadas, nginx correctamente expuesto, enrutamiento API, migraciones controladas, healthchecks, secretos externos y procedimiento de rollback.
- Resolver las vulnerabilidades de dependencias aplicables y endurecer autenticación, autorización, cookies, CORS/CSRF, rate limiting, validación, límites de carga y protección de endpoints mutables.
- Completar identidad, perfil, privacidad, preferencias, reputación y recuperación de cuenta sin exponer contraseñas ni ubicación precisa innecesaria.
- Completar el ciclo de vida de libros y publicaciones: propietario, búsqueda/filtros, ubicación segura, estados, caducidad, verificación autorizada y consistencia de imágenes.
- Sustituir estadísticas, feed, sugerencias y actividad comunitaria simuladas por consultas persistentes, paginadas y con límites de respuesta; añadir estados, propiedad y moderación de rincones.
- Sustituir las conversaciones simuladas y el broadcast global por conversaciones privadas persistentes, historial, pertenencia, estados de lectura y eventos Socket.IO aislados por sala.
- Terminar la PR #138 como entrega enfocada en acuerdos de intercambio: incorporar la rama a una base actualizada, resolver todos los comentarios, corregir estado obsoleto, persistir acuerdos/versiones y cubrir confirmación, cancelación y concurrencia. El agente preparará y verificará la PR, pero el merge quedará siempre en manos del usuario.
- Incorporar notificaciones, bloqueo, denuncia, moderación, trazabilidad de acciones sensibles y flujo posterior al encuentro necesarios para operar el intercambio de forma segura.
- Añadir observabilidad, retención de datos, copias/restauración, métricas operativas, pruebas de integración/E2E y documentación de recuperación, desarrollo, producción y credenciales.
- Reconciliar `docs/backlog.md`, OpenAPI y OpenSpec con el comportamiento entregado; clasificar onboarding, alianzas, donaciones y otras expansiones como trabajo posterior cuando no bloqueen el MVP.

## Capabilities

### New Capabilities

- `development-runtime`: Arranque local determinista, configuración, migraciones, datos de prueba, diagnóstico de puertos y documentación de credenciales.
- `production-delivery`: Build, configuración, despliegue, healthchecks, migraciones, secretos, backup/restore y rollback de producción.
- `platform-security`: Controles transversales de autenticación, autorización, abuso, dependencias, transporte, cargas y registro seguro.
- `identity-profile-reputation`: Registro, sesión, recuperación, perfil, privacidad, preferencias, bloqueo y reputación de usuarios.
- `catalog-listing-lifecycle`: Catálogo, publicaciones, búsqueda, propiedad, verificación, ubicación, imágenes, estados y caducidad.
- `community-map`: Rincones, mapa, feed, estadísticas, sugerencias y actividad basados en datos persistentes, paginados y moderables.
- `realtime-messaging`: Conversaciones privadas y mensajes persistentes con autorización, historial, lectura, adjuntos y eventos por sala.
- `exchange-agreements`: Acuerdos versionados de intercambio, transiciones, confirmación/cancelación, concurrencia, auditoría y cierre de la PR #138.
- `trust-safety-notifications`: Denuncias, moderación, notificaciones, trazabilidad y flujos de seguridad antes y después del encuentro.
- `operational-quality`: Contratos OpenAPI, pruebas, observabilidad, métricas, retención, runbooks y coherencia del backlog.

### Modified Capabilities

No existen especificaciones base en `openspec/specs`; todas las capacidades anteriores se introducen como contratos nuevos para describir y completar el comportamiento existente.

## Impact

- Afecta a frontend React/Rsbuild, backend Express/Socket.IO, PostgreSQL/PostGIS, migraciones, OpenAPI, Docker/Compose/nginx, CI, dependencias y documentación.
- Introduce cambios de esquema para perfiles, conversaciones, mensajes, acuerdos/versiones, notificaciones, denuncias, moderación y auditoría; las migraciones deberán ser incrementales y reversibles mediante restauración verificada.
- Requiere separar el trabajo en entregas revisables: estabilización base, cierre de PR #138, seguridad/datos, producción/operaciones y funcionalidades posteriores al MVP.
- Mantiene compatibilidad de API cuando sea razonable; cualquier ruptura restante deberá versionarse o documentarse con migración de consumidores.
- Ninguna tarea automatizará el merge de la PR #138 ni de futuras PRs: tras superar las puertas de calidad se notificará al usuario para que realice el merge manualmente.
