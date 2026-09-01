# Arquitectura actual

## Vista general

```text
Navegador
  ├─ React/Rsbuild (3000 en dev, bundle estático en despliegue)
  ├─ HTTP /api ───────────────┐
  └─ Socket.IO /socket.io ────┤
                               ▼
                    Backend Express (4000)
                               │
                               ▼
                    PostgreSQL / PostGIS
```

En desarrollo Rsbuild proxifica `/api` y `/socket.io` al backend. En producción el proxy o servidor que entrega el frontend debe conservar esos mismos contratos. La configuración de despliegue puede variar; este documento describe la aplicación y el entorno local, no una topología cloud obligatoria.

## Límites

- `frontend/` contiene rutas, componentes, estado, i18n, clientes HTTP y Socket.IO.
- `backend/src/routes/` contiene endpoints HTTP; `backend/src/socket.ts` contiene eventos en tiempo real.
- `backend/src/repositories/` es la frontera de persistencia.
- `backend/migrations/` es la fuente de verdad del esquema aplicado.
- MSW/mock es una capacidad del cliente para desarrollo y pruebas, no una base de datos alternativa del backend.

## Mensajería

`GET /api/messages` lista conversaciones autenticadas y calcula `unreadCount` únicamente con mensajes recibidos después del cursor de lectura del participante. `GET /api/messages/contacts?search=` busca personas públicas por nombre o alias, prioriza a quienes el usuario sigue y excluye al propio usuario y a relaciones bloqueadas. Los eventos `conversation:join`, `conversation:leave` y `conversation:message` operan sobre una conversación autorizada. El backend persiste el mensaje antes de emitirlo para que una reconexión o una recarga no lo pierdan.

La migración `015_seed_messaging_bot.sql` crea el usuario bot. El repositorio garantiza una conversación bot por usuario con bloqueo advisory e inserción idempotente. La respuesta del bot se guarda como mensaje normal y luego se entrega por Socket.IO. El handler global legacy (`message`) sigue disponible por compatibilidad y no debe usarse para validar la persistencia nueva.

## Modos del frontend

`PUBLIC_API_USE_MOCKS=true` activa MSW para los handlers soportados; no requiere PostgreSQL para esos flujos. Con `false` u omitida, la aplicación usa backend real. La variable es pública y de build-time: cambiar `.env` sin reiniciar no cambia el bundle ya cargado.

## Despliegue

Los Dockerfiles, compose y workflows son la referencia para empaquetado y CI/CD. Las notas históricas de AWS/nginx que existan en documentos antiguos deben leerse como contexto, no como requisito local. Antes de cambiar infraestructura, actualiza este documento y el workflow afectado.
