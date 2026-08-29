# Notas de amenazas MVP

## Activos y límites

Los activos principales son cuentas/sesiones, publicaciones de libros,
mensajes privados, acuerdos de intercambio y la ubicación de rincones. El
prototipo no implementa moderadores ni control de inventario completo; la
verificación automática del libro no sustituye una revisión humana futura.

## Amenazas cubiertas

- **CSRF y origen cruzado:** cookie de sesión con `SameSite=Strict`, CORS por
  allowlist exacta y protección `Origin` para mutaciones en producción.
- **Acceso no autenticado:** rincones y verificación de libros requieren sesión;
  mensajes/acuerdos además comprueban pertenencia y estado de la operación.
- **IDOR en publicaciones:** las actualizaciones comprueban propietario y
  devuelven 403 sin modificar datos ajenos.
- **Filtración accidental:** headers de seguridad de Helmet, respuestas de error
  con claves i18n y redacción de secretos/PII en metadata de logs.
- **Denegación de servicio conocida:** dependencias runtime auditadas y
  actualizadas; los límites de JSON y de paginación siguen aplicándose.

## Riesgo residual explícito

El servicio depende de que el despliegue use HTTPS, un `JWT_SECRET` fuerte,
backups y una base protegida por red. Las pruebas automáticas no reemplazan una
revisión de infraestructura ni una prueba manual del navegador con cookies,
proxy y Socket.IO.
