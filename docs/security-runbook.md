# Manual operativo de seguridad del MVP

Este documento describe los controles operativos que deben comprobarse antes de
usar el backend fuera de desarrollo. El alcance es el MVP del TFG: sesión,
publicaciones, rincones, mensajería privada y acuerdos.

## Variables obligatorias

En producción configura `JWT_SECRET` con un secreto fuerte y
`FRONTEND_URL` con el origen exacto del frontend, por ejemplo
`https://app.example.com`. El backend falla al iniciar si falta `FRONTEND_URL`
o si contiene una ruta. No guardes `.env`, tokens, dumps ni datos personales en
el repositorio.

La cookie `sessionToken` es `HttpOnly`, `Secure` y `SameSite=Strict` en
producción. El frontend y backend deben compartir el mismo esquema HTTPS.

## Comprobaciones antes de revisar o desplegar

```bash
npm audit --omit=dev
npm run typecheck -w backend
npm run test:backend
npm run openapi -w backend
```

Comprueba que el audit runtime no tenga vulnerabilidades críticas/altas sin
excepción documentada. Ejecuta las pruebas con una base aislada; no borres ni
repares automáticamente una base existente que tenga hashes de migración
distintos.

## CORS, CSRF y acceso

- CORS solo acepta el origen exacto de `FRONTEND_URL` y credenciales.
- Las mutaciones de producción requieren un header `Origin` igual al origen
  configurado; un origen cruzado o ausente devuelve 403.
- Las rutas mutables MVP requieren sesión y las publicaciones requieren además
  ser del propietario. Las rutas de lectura pública no deben recibir cookies
  como requisito.
- `X-Request-Id` permite correlacionar una respuesta con su línea de access log.

## Incidentes y diagnóstico

Conserva método, ruta, estado, timestamp y `X-Request-Id`. No copies cookies,
tokens, contraseñas, emails ni direcciones privadas en tickets. El logger
central redacts esos campos cuando se envían como metadata; evita agregar
`console.log` con bodies completos.

Si falla una migración por hash, detén el despliegue, identifica el entorno y
compara la migración aplicada con el archivo versionado. No edites migraciones
aplicadas: crea una nueva numerada y documenta rollback/backup.
