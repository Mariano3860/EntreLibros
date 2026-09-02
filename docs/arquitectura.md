# Arquitectura actual

## Vista general

```text
Navegador
  ├─ React/Rsbuild ── HTTP /api ───────┐
  └─ Socket.IO /socket.io ────────────┤
                                      ▼
                               Express/TypeScript
                                      │
                                      ▼
                               PostgreSQL/PostGIS
```

En desarrollo, Rsbuild proxifica `/api` y `/socket.io` al backend. Los Dockerfiles, archivos Compose y workflows son la referencia para empaquetado y CI/CD. Este documento describe el entorno local y no presupone una topología cloud concreta.

## Responsabilidades

- `frontend/`: rutas, componentes, estado, i18n, clientes HTTP y Socket.IO.
- `backend/src/routes/`: endpoints HTTP.
- `backend/src/socket.ts`: eventos en tiempo real.
- `backend/src/repositories/`: acceso a PostgreSQL.
- `backend/migrations/`: fuente de verdad del esquema aplicado.
- `frontend/mocks/`: respuestas de demo para MSW; no es una base de datos alternativa.

## Comunidad y descubrimiento

`GET /api/community/feed` proyecta historias y publicaciones visibles respetando perfiles, bloqueos y sesión. Likes, comentarios, seguimiento e historias relevantes tienen persistencia. El mapa consulta Rincones, publicaciones y actividad con filtros de radio y ubicación aproximada; el centro puede venir de la geolocalización del dispositivo o de `GET /api/user/profile` para la zona privada de la persona autenticada. Las respuestas mantienen coordenadas públicas aproximadas y omiten la distancia cuando no existe un centro válido.

## Mensajería

`GET /api/messages` lista conversaciones autenticadas y calcula `unreadCount` desde el cursor de lectura. `GET /api/messages/contacts?search=` busca personas públicas por nombre o alias y respeta seguimiento, visibilidad y bloqueos.

Los eventos `conversation:join`, `conversation:leave` y `conversation:message` operan sobre conversaciones autorizadas. El backend persiste cada mensaje antes de emitirlo, y el cliente invalida el listado para mantener sincronizados historial, no leídos y notificaciones. El bot persistente se crea de forma idempotente con la migración `015_seed_messaging_bot.sql`.

## Perfil y privacidad

`PATCH /api/user/profile` actualiza los datos editables del usuario autenticado. La calle solo existe en el contexto autorizado; el perfil público puede ocultar la ubicación o mostrar país, ciudad o barrio aproximado con coordenadas redondeadas.

## Modos del frontend

`PUBLIC_API_USE_MOCKS=true` activa MSW para los flujos de demo soportados. Con `false` u omitida, el cliente utiliza backend y Socket.IO reales. La variable se resuelve durante dev/build y requiere reiniciar Rsbuild al cambiarla.
