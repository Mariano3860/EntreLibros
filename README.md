# EntreLibros

EntreLibros es una plataforma web para descubrir, compartir y ofrecer libros
fisicos en comunidad. El monorepo contiene un frontend React/Rsbuild y un backend
TypeScript/Express con PostgreSQL/PostGIS y Socket.IO.

## Inicio rapido

Requisitos: Node `>=22.19.0 <23`, npm y PostgreSQL/PostGIS para el modo real.

```bash
npm install
npm run migrate
npm run dev
```

El frontend se sirve normalmente en `http://localhost:3000` y el backend en
`http://localhost:4000`. Rsbuild proxifica `/api` y `/socket.io` al backend.

## Modos de ejecucion

Las variables publicas del frontend empiezan con `PUBLIC_`. Para MSW:

```env
PUBLIC_API_USE_MOCKS=true
```

Con `false` u omitida se usan API y Socket.IO reales. Reinicia Rsbuild tras
cambiar `.env` o `.env.local`. Comprueba el modo con:

```js
document.documentElement.dataset.apiMode;
```

## Descubrimiento publico

Las personas visitantes pueden leer Inicio, Explorar libros, Comunidad, Mapa,
Ayuda, perfiles publicos y detalles de publicaciones sin cargar consultas
privadas. Publicar, contactar, guardar, reaccionar, comentar, seguir, crear
rincones y proponer intercambios usan una unica modal de autenticacion; el
retorno a login/registro conserva solamente rutas locales seguras.

## Dataset de demo real

Sobre una base aislada y ya migrada:

```bash
psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
```

El script crea dos usuarios sinteticos, publicaciones, un Rincon, conversacion,
acuerdo, notificaciones, eventos y un resultado. Los borradores reales se
guardan en `message_drafts` y no forman parte del historial hasta enviarlos. No
lo ejecutes sobre produccion.
La ruta `/profile/:id`, el contacto desde publicacion/perfil, los reportes y
`/stats` forman parte del recorrido real.

Para completar el catalogo visual de una base local ya migrada, cargar el
dataset curado:

```bash
psql "$DATABASE_URL" -f backend/scripts/seed-realistic-local-dataset.sql
```

Este script corrige textos con codificacion rota, agrega portadas a todas las
publicaciones, asigna avatares de desarrollo y reemplaza las fotos de los
Rincones por imagenes publicas. Conserva ids, relaciones, contrasenas y el
avatar subido existente. Ejecutalo solamente sobre la base de desarrollo.

## Verificacion

```bash
npm run test:backend
npm run test:frontend
npm run typecheck -w backend
npm run typecheck -w frontend
npm run build -w backend
npm run build -w frontend
npm run complete-check
```

La validacion manual de cookies, proxy, cache, mapa, Socket.IO, responsive y
privacidad esta en [`docs/tfg-browser-checklist.md`](docs/tfg-browser-checklist.md)
y [`docs/recovery-baseline.md`](docs/recovery-baseline.md).

## Documentacion

- [`docs/estado-actual.md`](docs/estado-actual.md): capacidades y limites.
- [`docs/tfg-mvp-trazabilidad.md`](docs/tfg-mvp-trazabilidad.md): matriz del TFG.
- [`docs/tfg-browser-checklist.md`](docs/tfg-browser-checklist.md): evidencia manual.
- [`docs/arquitectura.md`](docs/arquitectura.md): arquitectura.
- [`docs/base_de_datos.md`](docs/base_de_datos.md): esquema y migraciones.
- [`docs/security-runbook.md`](docs/security-runbook.md): seguridad.
- [`docs/recovery-baseline.md`](docs/recovery-baseline.md): recuperacion.

No guardes credenciales, archivos `.env`, dumps, datos personales ni material
privado en el repositorio.
