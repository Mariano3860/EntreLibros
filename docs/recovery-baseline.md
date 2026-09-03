# Recuperacion y validacion del entorno

Esta guia comprueba que EntreLibros arranca, conserva datos y funciona con
navegador real. Las pruebas automatizadas no sustituyen cookies, proxy, cache,
permisos de ubicacion ni Socket.IO.

## Puesta en marcha

1. Instala Node `>=22.19.0 <23`, npm y PostgreSQL/PostGIS.
2. Configura el backend en `.env` local y no lo guardes en Git.
3. Ejecuta `npm run migrate` sobre una base aislada.
4. Carga el dataset sintetico:

   ```bash
   psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
   ```

5. Levanta backend y frontend con `npm run dev`.
6. Usa `PUBLIC_API_USE_MOCKS=false` u omitida para persistencia real.

## Checklist de navegador

La checklist detallada esta en [`tfg-browser-checklist.md`](tfg-browser-checklist.md).
Comprueba que `/api` y `/socket.io` llegan al backend, que el modo resuelto es
`real`, que una recarga conserva los datos, que el mapa respeta ubicacion
aproximada, que el contacto/acuerdo/notificacion se reconstruye y que los estados
de carga, vacio y error ofrecen reintento.

## Backup y restauracion

Antes de migrar una base compartida realiza un backup verificable fuera del
repositorio. Restaura sobre una base aislada, valida PostGIS, tablas, migraciones,
usuarios sinteticos y rutas principales, y registra fecha, entorno y resultado.
No edites migraciones aplicadas: crea una migracion acumulativa. El backup/restore
real del entorno de despliegue queda pendiente de ejecutar y documentar.

## Calidad

```bash
npm run test:backend
npm run test:frontend
npm run typecheck -w backend
npm run typecheck -w frontend
npm run build -w backend
npm run build -w frontend
npm run complete-check
```

## Datos de prueba

Usa solamente las cuentas y publicaciones sinteticas del script de demo. No
copies usuarios reales, correos, direcciones, tokens, cookies ni dumps en el
repositorio o en capturas.
