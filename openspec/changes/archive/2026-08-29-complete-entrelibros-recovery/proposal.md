## Por qué

EntreLibros tiene un núcleo funcional que compila y pasa sus pruebas, pero hoy no ofrece un camino reproducible desde un clon limpio hasta un despliegue seguro: la configuración local entra en conflicto, producción no está cableada correctamente y varias capacidades visibles todavía dependen de mocks o estado sólo del cliente. Este cambio convierte el estado actual y el trabajo abierto de la PR #138 en un programa verificable para terminar un MVP desplegable, mantenible y documentado.

## MVP del TFG y control de alcance

El MVP se rige por la versión local del TFG `TFG ULTIMA VERSION - ROJO - MARIANO.pdf`. El trabajo no puede quitar ninguna de estas capacidades: autenticación y perfil básico con privacidad; Rincones de Libros con alta/edición, foto, mapa y ubicación aproximada; publicaciones `ofrezco`/`busco` con ficha bibliográfica e ISBN opcional; búsqueda con filtros y cercanía; mensajería 1:1; acuerdos con lugar, horario, confirmación y recordatorio; y notificaciones in-app básicas.

Las tareas de esta OpenSpec se limitan a `MVP` y `SOPORTE MVP`. Las expansiones `POST-MVP` se retiran del listado ejecutable, permanecen registradas en el roadmap/backlog y requerirán una OpenSpec propia antes de implementarse. Cada tarea implementada debe explicar su relación con una capacidad del TFG, incluir comentarios cuando la decisión no sea obvia y aportar una verificación reproducible.

## Qué cambia

- Establecer un único flujo de desarrollo reproducible para Node.js, PostgreSQL/PostGIS, migraciones, variables de entorno, frontend y backend, incluyendo detección clara de conflictos de puertos y servicios locales.
- **BREAKING**: normalizar los contratos de configuración y despliegue (`PUBLIC_API_BASE_URL`, URLs con `/api`, puertos, `NODE_ENV`, nombres de secretos y versión de Node), eliminando variantes contradictorias.
- Construir un despliegue de producción reproducible con imágenes locales/versionadas, nginx correctamente expuesto, enrutamiento API, migraciones controladas, healthchecks, secretos externos y procedimiento de rollback.
- Resolver las vulnerabilidades de dependencias aplicables y endurecer autenticación, autorización, cookies, CORS/CSRF, rate limiting, validación, límites de carga y protección de endpoints mutables.
- Completar identidad, perfil, privacidad y preferencias mínimas del MVP sin exponer contraseñas ni ubicación precisa innecesaria; reputación y recuperación de cuenta quedan diferidas.
- Completar el ciclo de vida de libros y publicaciones: propietario, búsqueda/filtros, ubicación segura, estados, caducidad, verificación autorizada y consistencia de imágenes.
- Sustituir estadísticas, feed, sugerencias y actividad comunitaria simuladas por consultas persistentes, paginadas y con límites de respuesta; añadir estados, propiedad y moderación de rincones.
- Sustituir las conversaciones simuladas y el broadcast global por conversaciones privadas persistentes, historial, pertenencia, estados de lectura y eventos Socket.IO aislados por sala.
- Terminar la PR #138 como entrega enfocada en acuerdos de intercambio: incorporar la rama a una base actualizada, resolver todos los comentarios, corregir estado obsoleto, persistir acuerdos/versiones y cubrir confirmación, cancelación y concurrencia. El agente preparará y verificará la PR, pero el merge quedará siempre en manos del usuario.
- Incorporar notificaciones in-app básicas de mensajes y acuerdos; denuncias, moderación avanzada, reputación y flujo posterior al encuentro quedan fuera de esta entrega.
- Añadir observabilidad, retención de datos, copias/restauración, métricas operativas, pruebas de integración/E2E y documentación de recuperación, desarrollo, producción y credenciales.
- Reconciliar `docs/backlog.md`, OpenAPI y OpenSpec con el comportamiento entregado; clasificar onboarding, alianzas, donaciones y otras expansiones como trabajo posterior cuando no bloqueen el MVP.

## Capacidades

### Capacidades nuevas

- `development-runtime`: Arranque local determinista, configuración, migraciones, datos de prueba, diagnóstico de puertos y documentación de credenciales.
- `production-delivery` [SOPORTE MVP]: Build, configuración, despliegue mínimo, healthchecks, migraciones, secretos, backup/restore y rollback.
- `platform-security` [MVP y SOPORTE MVP]: Controles de autenticación, autorización, dependencias, transporte y registro seguro; abuso avanzado queda diferido.
- `identity-profile-reputation` [MVP]: Registro, sesión, perfil, privacidad, preferencias y bloqueo; recuperación y reputación quedan diferidas.
- `catalog-listing-lifecycle`: Catálogo, publicaciones, búsqueda, propiedad, verificación, ubicación, imágenes, estados y caducidad.
- `community-map` [MVP]: Rincones, mapa, propiedad básica, privacidad y consultas acotadas; feed, estadísticas, sugerencias y moderación quedan diferidos.
- `realtime-messaging`: Conversaciones privadas y mensajes persistentes con autorización, historial, lectura, adjuntos y eventos por sala.
- `exchange-agreements`: Acuerdos versionados de intercambio, transiciones, confirmación/cancelación, concurrencia, auditoría y cierre de la PR #138.
- `trust-safety-notifications` [MVP parcial]: Notificaciones in-app básicas de mensajes y acuerdos; denuncias, moderación y flujos posteriores quedan diferidos.
- `operational-quality`: Contratos OpenAPI, pruebas, observabilidad, métricas, retención, runbooks y coherencia del backlog.

### Capacidades modificadas

No existen especificaciones base en `openspec/specs`; todas las capacidades anteriores se introducen como contratos nuevos para describir y completar el comportamiento existente.

## Impacto

- Afecta a frontend React/Rsbuild, backend Express/Socket.IO, PostgreSQL/PostGIS, migraciones, OpenAPI, Docker/Compose/nginx, CI, dependencias y documentación.
- Introduce cambios de esquema para perfiles, conversaciones, mensajes, acuerdos/versiones, notificaciones, denuncias, moderación y auditoría; las migraciones deberán ser incrementales y reversibles mediante restauración verificada.
- Requiere separar el trabajo en entregas revisables: estabilización base, cierre de PR #138, seguridad/datos, producción/operaciones y funcionalidades posteriores al MVP.
- Mantiene compatibilidad de API cuando sea razonable; cualquier ruptura restante deberá versionarse o documentarse con migración de consumidores.
- Ninguna tarea automatizará el merge de la PR #138 ni de futuras PRs: tras superar las puertas de calidad se notificará al usuario para que realice el merge manualmente.
