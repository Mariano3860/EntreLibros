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
compatibilidad de esquema de reportes. Para el dataset local usa:

```bash
psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
```

No ejecutes la semilla sobre una base de produccion.

## Rutas relevantes

- `GET /api/messages` y Socket.IO persisten mensajes antes de emitirlos.
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
