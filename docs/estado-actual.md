# Estado actual

Fecha de referencia: 2026-08-29.

## Comprobado en el repositorio

- Monorepo con frontend React/Rsbuild y backend TypeScript/Express.
- PostgreSQL/PostGIS con migraciones 001–015.
- API de mensajes y eventos Socket.IO con persistencia antes de emitir.
- Bot persistente creado por migración, con conversación idempotente por usuario e historial recargable.
- Modo MSW controlado por `PUBLIC_API_USE_MOCKS` en el bundle del frontend.
- Pruebas Vitest frontend/backend y checks de tipo, lint, formato y build disponibles.

## Límites conocidos

- MSW no reemplaza una prueba contra PostgreSQL.
- El modo público depende de variables de build; cambiar `.env` requiere reiniciar Rsbuild.
- La verificación en navegador de cookies, proxy, caché y WebSocket debe hacerse aparte de Vitest.
- El canal global legacy del bot existe por compatibilidad y no debe confundirse con su conversación persistida.

## Cómo comprobar mensajes

1. Ejecuta `npm run migrate`.
2. Inicia backend y frontend.
3. Usa una sesión autenticada con mocks desactivados.
4. Entra en `/messages`, abre “Bot” y envía un texto.
5. Confirma la respuesta, recarga la página y confirma que ambos mensajes siguen allí.
6. Revisa la pestaña Network para `GET /api/messages` y la conexión `/socket.io`.
