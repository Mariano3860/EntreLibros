# Manual operativo de seguridad

El alcance de este manual es el MVP local: sesión, perfiles, publicaciones, Rincones, mensajería y acuerdos. Antes de usar el backend fuera de desarrollo, comprueba la configuración real y registra cualquier límite.

## Configuración

- Define `JWT_SECRET` con un secreto fuerte y `FRONTEND_URL` con el origen exacto del frontend.
- No guardes `.env`, tokens, dumps ni datos personales en el repositorio.
- En producción, usa HTTPS y una cookie `sessionToken` con `HttpOnly`, `Secure` y `SameSite=Strict`.
- Ejecuta pruebas y migraciones sobre una base aislada antes de tocar una base compartida.

## Comprobaciones

```bash
npm audit --omit=dev
npm run typecheck -w backend
npm run test:backend
npm run openapi -w backend
```

Revisa vulnerabilidades críticas o altas, autorización por propietario y conversación, validación de entradas, errores con claves de traducción y logs sin credenciales ni datos privados.

## CORS, CSRF y acceso

- CORS debe aceptar solo el origen configurado y las credenciales necesarias.
- Las mutaciones fuera de desarrollo deben validar el header `Origin`.
- Las rutas mutables requieren sesión; publicar o editar requiere además ser propietario.
- Los mensajes y acuerdos comprueban pertenencia, estado y participante.
- `X-Request-Id` permite relacionar una respuesta con su log sin copiar información sensible.

## Incidentes

Conserva método, ruta, estado, timestamp y `X-Request-Id`. No copies cookies, tokens, contraseñas, correos ni direcciones privadas en tickets. Si falla una migración por hash, detén el despliegue, compara el entorno con el archivo versionado y crea una migración numerada para corregirlo; nunca edites una migración aplicada.

Los riesgos de infraestructura —HTTPS, secreto de sesión, red de base de datos, backups, restauración y proveedores externos— deben comprobarse en el entorno donde se despliegue y no darse por supuestos por la configuración local.
