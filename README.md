# EntreLibros

EntreLibros es una plataforma web para descubrir, compartir, reseñar e intercambiar libros físicos en comunidad. El monorepo contiene un frontend React/Rsbuild y un backend TypeScript/Express con PostgreSQL/PostGIS y Socket.IO.

## Inicio rápido

Requisitos: Node `>=22.19.0 <23`, npm y PostgreSQL para el modo real.

```bash
npm install
npm run migrate
npm run dev
```

El frontend se sirve normalmente en `http://localhost:3000` y el backend en `http://localhost:4000`. Rsbuild proxifica `/api` y `/socket.io` al backend. También se puede levantar PostgreSQL/PostGIS con el compose disponible en el repositorio.

## Modos de ejecución

Las variables públicas del frontend comienzan con `PUBLIC_`. Para usar MSW en pruebas o una demo aislada:

```env
PUBLIC_API_USE_MOCKS=true
```

Con `true`, el frontend usa respuestas de demostración y no persiste en PostgreSQL. Con `false` u omitida, utiliza la API y Socket.IO reales. Después de cambiar `.env` o `.env.local`, reinicia Rsbuild. El modo resuelto puede comprobarse con:

```js
document.documentElement.dataset.apiMode
```

La mensajería real requiere sesión, backend activo y migraciones aplicadas. La migración `015_seed_messaging_bot.sql` crea el bot persistente y sus conversaciones de forma idempotente.

## Verificación

```bash
npm run test:backend
npm run test:frontend
npm run typecheck -w backend
npm run typecheck -w frontend
npm run build -w backend
npm run build -w frontend
npm run complete-check
```

Vitest/Testing Library y MSW cubren pruebas automatizadas. La validación final del navegador debe comprobar cookies, proxy, caché, modo real, mapa y Socket.IO; consulta [`docs/recovery-baseline.md`](docs/recovery-baseline.md).

## Documentación

- [`backend/README.md`](backend/README.md): API, migraciones y mensajería.
- [`frontend/README.md`](frontend/README.md): desarrollo del cliente y modo demo.
- [`docs/README.md`](docs/README.md): índice de documentación.
- [`docs/estado-actual.md`](docs/estado-actual.md): capacidades verificadas y límites.
- [`docs/backlog.md`](docs/backlog.md): pendientes de producto y criterios de cierre.
- [`docs/arquitectura.md`](docs/arquitectura.md): arquitectura y límites técnicos.
- [`docs/base_de_datos.md`](docs/base_de_datos.md): esquema y migraciones.
- [`docs/messaging-bubbles.md`](docs/messaging-bubbles.md): mensajería, acuerdos y no leídos.
- [`docs/recovery-baseline.md`](docs/recovery-baseline.md): recuperación y validación del entorno.
- [`docs/security-runbook.md`](docs/security-runbook.md): controles operativos de seguridad.
- [`docs/threat-model.md`](docs/threat-model.md): amenazas y riesgos residuales.
- [`docs/troubleshooting.md`](docs/troubleshooting.md): problemas frecuentes.

## Estructura

- `backend/`: API, persistencia, migraciones y Socket.IO.
- `frontend/`: interfaz React, rutas, i18n, MSW y clientes de API.
- `docs/`: documentación actual del producto y su operación.
- `.github/workflows/`: validaciones y empaquetado CI/CD.

No se deben guardar credenciales, archivos `.env`, dumps, datos personales ni material de referencia privado en el repositorio.
