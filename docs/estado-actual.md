# Estado actual

Fecha de referencia: 2026-08-30.

## Comprobado en el repositorio

- Monorepo con frontend React/Rsbuild y backend TypeScript/Express.
- PostgreSQL/PostGIS con migraciones 001–021.
- API de mensajes y eventos Socket.IO con persistencia antes de emitir.
- Bot persistente creado por migración, con conversación idempotente por usuario e historial recargable.
- Modo MSW controlado por `PUBLIC_API_USE_MOCKS` en el bundle del frontend.
- Pruebas Vitest frontend/backend y checks de tipo, lint, formato y build disponibles.

## Límites conocidos

- MSW no reemplaza una prueba contra PostgreSQL.
- El modo público depende de variables de build; cambiar `.env` requiere reiniciar Rsbuild.
- La verificación en navegador de cookies, proxy, caché y WebSocket debe hacerse aparte de Vitest.
- El canal global legacy del bot existe por compatibilidad y no debe confundirse con su conversación persistida.

## Hallazgos de validación manual

El 2026-08-30 se detectó una brecha entre capacidades técnicas documentadas y la experiencia observable con datos reales. El detalle accionable está en la sección [Prioridad P0 del backlog](backlog.md#prioridad-p0--brechas-observadas-en-validación-manual). En resumen:

- El inicio y algunas secciones de libros muestran datos incompletos o mockeados; además, hay enlaces “Ver todos” sin acción y debe definirse la relación entre “Mis libros” y “Mi actividad”.
- El flujo de publicación tiene problemas de contraste en modo oscuro.
- Comunidad todavía presenta datos falsos, un botón de publicación inerte, recorte incorrecto de imágenes y un mini mapa sin contenido visible ni controles operativos.
- `/map` no inicia en la ubicación del usuario, no muestra un indicador de posición y el filtro de distancia no recorre ni pinta correctamente todo su rango.
- En mensajería, el chat no abre en el último mensaje y los flujos de adjuntar libro/proponer intercambio no cargan los libros del usuario.
- El logout ocurre sin confirmación.

La implementación de `close-p0-product-experience-gaps` corrigió estos recorridos en la rama `p0-product-experience`: “Todos” incluye los libros propios de la sesión, Comunidad permite historias persistidas, el mini mapa tiene un único acceso al mapa, `/map` reacciona a geolocalización autorizada y mantiene el mapa expandido, y los adjuntos de libro se guardan en el historial. Resta validar visualmente en navegador con servicios reales, especialmente permisos de geolocalización, contraste y publicación de historias.

## Cómo comprobar mensajes

1. Ejecuta `npm run migrate`.
2. Inicia backend y frontend.
3. Usa una sesión autenticada con mocks desactivados.
4. Entra en `/messages`, abre “Bot” y envía un texto.
5. Confirma la respuesta, recarga la página y confirma que ambos mensajes siguen allí.
6. Revisa la pestaña Network para `GET /api/messages` y la conexión `/socket.io`.

Para comprobar una historia, abre “Publicar” en Comunidad, escribe texto, enlaza opcionalmente una publicación propia y confirma que aparece tras invalidar el feed.
