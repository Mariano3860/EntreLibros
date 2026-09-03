# Modelo de amenazas del MVP

## Activos

- Cuentas, sesiones y preferencias de privacidad.
- Publicaciones, imagenes y metadata bibliografica.
- Ubicacion aproximada de Rincones y perfiles.
- Mensajes privados, acuerdos, outcomes y reportes.
- Eventos de producto con metadata minima.

## Controles actuales

- Cookies de sesion protegidas y validacion de origen en mutaciones.
- CORS restringido al frontend configurado.
- Autorizacion por usuario, propietario, participante y conversacion.
- Validacion de entradas, limites de JSON/paginacion y errores sin detalles internos.
- Redaccion de campos sensibles en logs.
- Redondeo de coordenadas y proyeccion publica por nivel de visibilidad.
- Reportes sin identidad publica del denunciante y outcomes no publicos.
- Eventos analiticos con idempotencia y sin correo, direccion o cuerpo de mensaje.

## Riesgos residuales

- La proteccion depende de HTTPS, `JWT_SECRET` fuerte y una base no expuesta.
- El prototipo no incluye rate limiting de aplicacion, moderacion humana completa,
  reputacion, retencion automatica ni exportacion/anonimizacion integral.
- Backups, restauracion, observabilidad avanzada y proveedores externos deben
  comprobarse en el entorno de despliegue.
- Las pruebas automatizadas no sustituyen una revision manual con cookies,
  proxy, permisos, responsive y Socket.IO.

Para revisar controles consulta [`security-runbook.md`](security-runbook.md).
