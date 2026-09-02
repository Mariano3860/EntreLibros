# Modelo de amenazas del MVP

## Activos

- Cuentas, sesiones y preferencias de privacidad.
- Publicaciones, imágenes y metadata bibliográfica.
- Ubicación aproximada de Rincones y perfiles.
- Mensajes privados, acuerdos y reportes.

## Controles actuales

- Cookies de sesión protegidas y validación de origen en mutaciones.
- CORS restringido al frontend configurado.
- Autorización por usuario, propietario, participante y conversación.
- Validación de entradas, límites de JSON/paginación y errores sin detalles internos.
- Redacción de campos sensibles en logs.
- Redondeo de coordenadas y proyección pública por nivel de visibilidad.
- Dependencias runtime auditables mediante `npm audit`.

## Riesgos residuales

- La protección depende de desplegar con HTTPS, un `JWT_SECRET` fuerte y una base no expuesta públicamente.
- El prototipo no incluye moderación humana completa, reputación ni control de inventario.
- Backups, restauración, rate limiting y observabilidad avanzada deben comprobarse en el entorno de despliegue.
- Las pruebas automatizadas no sustituyen una revisión manual del navegador con cookies, proxy, permisos y Socket.IO.

Para revisar controles y configuración consulta [`security-runbook.md`](security-runbook.md).
