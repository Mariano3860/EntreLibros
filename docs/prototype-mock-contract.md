# Contrato del prototipo visual y mocks

Fecha de referencia: 2026-08-30.

Este documento describe los datos de demostración que sostienen la reconstrucción visual de `recreate-ideal-prototype-ui`. No representa persistencia real ni modifica el contrato del backend actual. La matriz visual, medidas y manifest de recursos están en [`prototype-ui-reference.md`](prototype-ui-reference.md); el inventario de contratos que pueden reemplazarlo está en [`frontend-backend-reconnection-matrix.md`](frontend-backend-reconnection-matrix.md).

## Fuente de verdad del modo demo

El catálogo tipado vive en `frontend/src/features/prototype/catalog.ts`. Todas las pantallas nuevas consumen ese catálogo mediante `PrototypeProvider`; los handlers anteriores de libros, actividad y comunidad también reutilizan los mismos registros deterministas.

Entidades e IDs canónicos:

- Usuario visible: `mariano` (`@mariano`).
- Conversación seleccionada: `lucia`; propuesta relacionada con el libro `ecos-viento-norte`.
- Cinco libros: `ecos-viento-norte`, `mapa-luciernagas`, `cartas-verano`, `biblioteca-tiempo` y `misma-constelacion`.
- Rincón seleccionado: `cafe-literario`; alternativas `biblioteca-palermo` y `plaza-guemes`.
- Historia social inicial: `lucia-reading-corner`.
- Mensajes iniciales: `m1` a `m4`; `m4` es una propuesta.

El catálogo incluye además historias, conversaciones, KPIs, series semanales, rankings, contribuyentes, métricas y preferencias de perfil, objetivo, racha, logros, categorías de ayuda y FAQs. El orden de los arrays es parte del fixture visual y debe conservarse para que las capturas sean repetibles.

## Superficie MSW de demostración

Con `PUBLIC_API_USE_MOCKS=true`, MSW expone:

- `GET /api/demo/prototype`: devuelve `{ catalog, state }`.
- `GET /api/demo/prototype?fixture=empty`: devuelve catálogo vacío y conserva el estado de la sesión demo.
- `GET /api/demo/prototype?fixture=error`: devuelve HTTP 503 y `prototype_fixture_error`.
- `POST /api/demo/prototype/actions`: acepta una acción demo y devuelve `{ ok, state }`.

Acciones aceptadas actualmente por el handler:

| `type` | Efecto en memoria |
| --- | --- |
| `publish-story` | Inserta una historia social al comienzo. |
| `send-message` | Agrega un mensaje al chat. |
| `update-profile` | Combina los campos recibidos con el perfil demo. |
| `send-support` | Registra una consulta de soporte. |

Las mutaciones visibles se resuelven en el `PrototypeProvider` para respuesta inmediata: publicación social, mensajes, adjunto de libro, propuesta, período estadístico, FAQ y soporte. Mapa, filtros y formulario de perfil mantienen estado local de pantalla. Todo se reinicia al recargar; esa pérdida es intencional en esta especificación visual.

## Estados controlables

`FixtureState` lee el parámetro `fixture` de la URL sin desmontar el shell:

- `?fixture=loading`, `?fixture=empty` o `?fixture=error` aplica el estado global.
- `?fixture=<region>:loading`, `:empty` o `:error` limita el estado a una región, por ejemplo `feed:error`, `books:empty`, `activity:loading` o `kpis:error`.
- Loading muestra skeletons; empty no inventa actividad; error ofrece `Reintentar`, que limpia el parámetro y recupera el contenido.

## Recursos locales

Los fallbacks estables están en `frontend/public/prototype/`:

- `reading-room.svg`: hero de Inicio.
- `community-reading.svg`: media editorial del feed.
- `profile-cover.svg`: portada de Perfil.
- `help.svg`: ilustración del Centro de ayuda.
- `book-cover.svg`: fallback de portada.

Son SVG locales para evitar variaciones de red y mantener los crops reproducibles. El mapa y los gráficos son composiciones CSS/SVG del frontend, no capturas de un proveedor cartográfico.

## Contratos que deberá cubrir la futura OpenSpec backend

La siguiente especificación debe reemplazar el modo demo por datos persistentes sin cambiar la jerarquía visual:

- Un agregado de inicio con recomendaciones, KPIs y actividad real del usuario.
- Catálogo público paginado donde `Todos` sea siempre superconjunto de `Mis libros` visibles.
- Historias/publicaciones sociales con texto, media, libro enlazado, reacciones y comentarios.
- Conversaciones con adjuntos tipados y propuestas de intercambio persistentes.
- Búsqueda geoespacial de rincones, categorías, distancia, clusters y ubicación privada aproximada.
- Agregaciones estadísticas por período, rankings y exportación.
- Perfil extendido con intereses, preferencias, objetivo, racha, logros y métricas.
- Base de conocimiento, búsqueda de FAQs y tickets de soporte.

Para cada agregado deberán definirse autorización, paginación, estados vacíos, errores i18n, eventos Socket.IO cuando correspondan, política de medios y pruebas de persistencia. Los endpoints `/api/demo/prototype*` deben seguir siendo exclusivos del modo MSW y no implementarse en el backend productivo.
