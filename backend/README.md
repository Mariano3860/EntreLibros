# Backend de EntreLibros

Servicio Node.js/TypeScript con Express, PostgreSQL/PostGIS y Socket.IO. Expone
autenticacion, perfiles, libros, Comunidad, Rincones, mapa, mensajeria, acuerdos,
notificaciones, reportes y metricas.

## Ejecutar

Desde la raiz:

```bash
npm run migrate
npm run dev:backend
```

El servidor escucha normalmente en `http://localhost:4000`. La configuracion se
carga con `dotenv`; no guardes `.env` ni credenciales en el repositorio.

## Migraciones

Las migraciones se ejecutan en orden y son append-only. Las versiones 031-034
agregan outcomes privados de acuerdos, reportes, eventos de analitica y
compatibilidad de esquema de reportes; la 035 agrega borradores privados de
mensajeria con revision y adjuntos tipados. Para el dataset local usa:

```bash
psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
```

No ejecutes la semilla sobre una base de produccion.

## Rutas relevantes

- `GET /api/messages` y Socket.IO persisten mensajes antes de emitirlos.
- `GET|PUT|DELETE /api/messages/:conversationId/draft` permite recuperar,
  guardar y descartar el borrador privado del participante autenticado.
- `POST /api/messages/:conversationId/draft/send` valida y envia el borrador de
  forma idempotente; las propuestas de acuerdo se crean dentro de la misma
  transaccion que el mensaje.
- `POST /api/messages/conversations` acepta `silent: true` para preparar un
  contacto sin analitica ni notificacion hasta que la persona lo envie.
- `GET /api/map` requiere `north`, `south`, `east` y `west`; el bbox representa
  el viewport de `Sin limite`, mientras `distanceKm` conserva el centro radial.
  La respuesta limita rincones/publicaciones/actividad a 50/100/100 e informa
  truncamiento en `meta.truncated` y `meta.limits`.
- `POST /api/agreements/:id/outcome` registra el resultado privado de una parte.
- `POST /api/reports` recibe reportes autenticados con categorias controladas.
- `GET /api/community/metrics` devuelve el contrato de metricas del MVP.

## Comandos

```bash
npm run test:backend
npm run typecheck -w backend
npm run lint -w backend
npm run format:backend
npm run build -w backend
npm run openapi -w backend
```

Las imagenes son referencias HTTPS o datos inline limitados a JPG, PNG o WebP de
hasta 5 MB; no hay almacenamiento de objetos productivo.

Los borradores se conservan en `message_drafts` y solo se exponen a su autor;
el destinatario no puede descubrir su existencia. La migracion 035 es aditiva y
no tiene down-migration: para revertir la aplicacion, vuelve a una version de
backend anterior y conserva la tabla hasta planificar su eliminacion con una
backup verificada.
