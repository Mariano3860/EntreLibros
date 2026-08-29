# EntreLibros

EntreLibros es una plataforma web para descubrir, compartir, reseñar e intercambiar libros físicos. El repositorio contiene el frontend React/Rsbuild y el backend TypeScript/Express con PostgreSQL/PostGIS y Socket.IO.

## Inicio rápido

Requisitos: Node `>=22.19.0 <23`, npm y PostgreSQL para el modo real.

```bash
npm install
npm run migrate
npm run dev
```

El frontend de desarrollo corre normalmente en `http://localhost:3000` y el backend en `http://localhost:4000`. Rsbuild proxifica `/api` y `/socket.io` al backend. Para levantar dependencias locales puede usarse `docker compose up -d` según el compose disponible en el repositorio.

## Configuración del frontend

Las variables públicas se leen durante dev/build y deben comenzar con `PUBLIC_`. Copia el ejemplo disponible en `frontend/` si necesitas uno local y reinicia Rsbuild después de cambiarlo.

```env
PUBLIC_API_USE_MOCKS=true
```

Con `true`, los handlers MSW/mock cubren los flujos compatibles y no se debe esperar persistencia real. Con `false` u omitida, la aplicación usa la API y Socket.IO reales. El modo resuelto se refleja en `document.documentElement.dataset.apiMode`; si devuelve `undefined`, el bundle no recibió la variable o no se reinició el servidor.

## Mensajería y bot

La mensajería real requiere sesión autenticada, migraciones aplicadas y backend activo. La migración `015_seed_messaging_bot.sql` crea el usuario bot persistente; cada usuario obtiene una conversación con identidad “Bot” de forma idempotente. Los mensajes del bot se guardan antes de emitirse por Socket.IO y se cargan al volver a abrir la conversación. El canal global legacy también existe para compatibilidad, pero no representa la conversación persistida.

```bash
npm run migrate
```

Si `/messages` aparece vacío, comprueba el modo mock, la consola del navegador, `GET /api/messages`, cookies de sesión, conexión Socket.IO y el estado de las migraciones. La guía completa está en [`docs/recovery-baseline.md`](docs/recovery-baseline.md) y [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Verificación

```bash
npm run test:backend
npm run test:frontend
npm run format:backend
npm run format:frontend
npm run complete-check
```

Las pruebas frontend son Vitest/Testing Library con MSW; las pruebas de servicio backend validan HTTP, Socket.IO y persistencia cuando corresponde. Una comprobación en navegador sigue siendo necesaria para proxy, cookies, caché y variables públicas.

## Mapa del repositorio

- [`backend/README.md`](backend/README.md): API, base de datos, migraciones y backend.
- [`frontend/README.md`](frontend/README.md): desarrollo web, mock mode y troubleshooting del cliente.
- [`docs/arquitectura.md`](docs/arquitectura.md): arquitectura actual y límites históricos.
- [`docs/README.md`](docs/README.md): índice completo de documentación.
- [`docs/base_de_datos.md`](docs/base_de_datos.md): modelo y migraciones.
- [`docs/messaging-bubbles.md`](docs/messaging-bubbles.md): UI y contrato de mensajes.
- [`docs/estado-actual.md`](docs/estado-actual.md): estado verificable del producto.
- [`docs/roadmap.md`](docs/roadmap.md): dirección posterior a la recuperación.
- [`docs/guia-documentacion.md`](docs/guia-documentacion.md): cómo mantener la documentación sincronizada.
- [`docs/backlog.md`](docs/backlog.md): pendientes y trazabilidad.
- [`openspec/`](openspec/): propuestas y planes de cambios.

## Flujo de contribución

Trabaja en una rama, ejecuta las verificaciones, actualiza documentación/backlog y revisa `git diff --check`. El merge de una PR lo realiza el responsable del repositorio.
