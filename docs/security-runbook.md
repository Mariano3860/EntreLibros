# Manual operativo de seguridad

El alcance es el MVP local: sesion, perfiles, publicaciones, Rincones,
mensajeria, acuerdos, reportes y metricas. Antes de desplegar fuera de desarrollo
comprueba la configuracion real y registra los limites.

## Configuracion

- Define `JWT_SECRET` fuerte y `FRONTEND_URL` con el origen exacto.
- No guardes `.env`, tokens, dumps ni datos personales en el repositorio.
- En produccion usa HTTPS y la cookie `sessionToken` con `HttpOnly`, `Secure` y
  `SameSite=Strict`.
- Ejecuta pruebas y migraciones sobre una base aislada antes de una base compartida.

## Comprobaciones

```bash
npm audit --omit=dev
npm run typecheck -w backend
npm run test:backend
npm run openapi -w backend
```

Revisa autorizacion por propietario, participante y conversacion, validacion de
entradas, errores con claves i18n y logs sin credenciales, correo, direccion,
coordenadas exactas ni contenido privado.

## CORS, CSRF y acceso

- CORS acepta solo el origen configurado y las credenciales necesarias.
- Las mutaciones fuera de desarrollo validan `Origin`.
- Las rutas mutables requieren sesion; publicar o editar requiere propiedad.
- Mensajes, acuerdos, outcomes y reportes comprueban autenticacion y alcance.
- `X-Request-Id` relaciona respuesta y log sin copiar datos sensibles.

## Reportes, metricas y retencion

Los reportes usan categorias controladas y no devuelven la identidad del
denunciante. `analytics_events` guarda solo actor opcional, entidad, metadata
minima, fecha y clave idempotente; no guarda correo, direccion ni cuerpo de
mensajes. Los outcomes de acuerdos permanecen privados por participante.

La aplicacion no implementa todavia rate limiting, retencion automatica,
anonimizacion/exportacion completa ni revocacion historica de todos los datos.
Estos son riesgos residuales y no deben presentarse como controles operativos.

## Incidentes

Conserva metodo, ruta, estado, timestamp y `X-Request-Id`. No copies cookies,
tokens, contrasenas, correos ni direcciones privadas en tickets. Si falla una
migracion por hash, deten el despliegue, compara el entorno con el archivo
versionado y crea una migracion numerada; nunca edites una migracion aplicada.

HTTPS, secreto de sesion, red de base de datos, backups, restauracion y
proveedores externos deben comprobarse en el entorno de despliegue.
