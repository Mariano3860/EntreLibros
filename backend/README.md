# Backend de EntreLibros

Servicio Node.js/TypeScript con Express, PostgreSQL/PostGIS y Socket.IO. Expone autenticación, libros, mapa, acuerdos y mensajería.

## Ejecutar

Desde la raíz:

```bash
npm run migrate
npm run dev:backend
```

El servidor escucha normalmente en `http://localhost:4000`. La configuración se carga con `dotenv`; no comitees archivos `.env` ni credenciales.

## Migraciones

```bash
npm run migrate
```

Las migraciones están en `backend/migrations/` y se ejecutan en orden. Son append-only: para un cambio nuevo agrega un archivo numerado. La migración `015_seed_messaging_bot.sql` crea el usuario bot y deja preparada su identidad persistente.

## Mensajería

`GET /api/messages` lista conversaciones del usuario autenticado. El canal de conversación usa Socket.IO y persiste el mensaje antes de notificar a los clientes. La conversación del bot se crea de manera idempotente y sus respuestas se guardan en la base. El evento/canal global legacy se mantiene por compatibilidad.

## Comandos

```bash
npm run test:backend
npm run typecheck -w backend
npm run lint -w backend
npm run format:backend
npm run build -w backend
npm run openapi -w backend
```

Para errores de API, conserva claves de i18n en la respuesta pública. Para cambios de persistencia, cubre autorización, transacciones, reintentos y concurrencia en tests.
