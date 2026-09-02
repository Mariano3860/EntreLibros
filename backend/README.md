# Backend de EntreLibros

Servicio Node.js/TypeScript con Express, PostgreSQL/PostGIS y Socket.IO. Expone autenticación, perfiles, libros, Comunidad, Rincones, mapa, mensajería, acuerdos y notificaciones.

## Ejecutar

Desde la raíz:

```bash
npm run migrate
npm run dev:backend
```

El servidor escucha normalmente en `http://localhost:4000`. La configuración se carga con `dotenv`; no guardes archivos `.env` ni credenciales en el repositorio.

## Migraciones

Las migraciones están en `backend/migrations/` y se ejecutan en orden. Son append-only: para corregir un esquema existente agrega un archivo numerado nuevo. La migración `015_seed_messaging_bot.sql` crea el bot persistente y las migraciones posteriores agregan privacidad, descubrimiento, Comunidad, notificaciones y likes/comentarios.

```bash
npm run migrate
```

## Mensajería

`GET /api/messages` lista las conversaciones del usuario autenticado. `GET /api/messages/:conversationId/books` devuelve publicaciones disponibles para adjuntar o proponer un intercambio. Socket.IO persiste los mensajes antes de notificar a los clientes; los adjuntos tipados y acuerdos sobreviven a la recarga.

## Comandos

```bash
npm run test:backend
npm run typecheck -w backend
npm run lint -w backend
npm run format:backend
npm run build -w backend
npm run openapi -w backend
```

Los errores públicos deben conservar claves de traducción. Los cambios de persistencia deben cubrir autorización, transacciones, reintentos y concurrencia en pruebas.
