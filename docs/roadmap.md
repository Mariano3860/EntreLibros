# Hoja de ruta

Las interacciones sociales basicas de Comunidad ya estan persistidas: likes unicos, comentarios, compartir con fallback y stories relevantes. Las senales avanzadas y las colecciones tematicas quedan para una evolucion posterior.

El seguimiento y el descubrimiento personalizado de Comunidad ya cuentan con una primera implementaciÃ³n persistente; las colecciones temÃ¡ticas y las seÃ±ales avanzadas quedan como evoluciÃ³n posterior.

Este roadmap separa la recuperación terminada de las siguientes decisiones de producto.

## Trabajo diferido fuera de `complete-entrelibros-recovery`

Estas ideas se conservan como dirección futura, no como tareas pendientes del MVP. Cada una deberá tener una OpenSpec propia antes de implementarse:

- `post-mvp-trust-safety`: denuncias, moderación, reputación, ratings y flujo posterior al intercambio.
- `post-mvp-platform-hardening`: rate limiting avanzado, recuperación de contraseña, observabilidad y retención/exportación de datos.
- `post-mvp-production-integrations`: proveedores reales de email/storage, malware scanning y operaciones avanzadas.
- `post-mvp-community-insights`: estadísticas persistentes, sugerencias y crecimiento comunitario.

## Próximo

- Crear una OpenSpec backend derivada de [`prototype-mock-contract.md`](prototype-mock-contract.md) para sustituir gradualmente el catálogo visual por agregados reales, conservando IDs, estados y jerarquía de pantalla.
- Completar la aceptación por capturas 1440×900 de `recreate-ideal-prototype-ui` cuando haya un navegador conectado, antes de archivar el cambio.
- Validar en navegador el bloque P0 de brechas observadas, implementado en `close-p0-product-experience-gaps` sobre la rama `p0-product-experience`.
- Mantener separadas las superficies “Mis libros” y “Mi actividad”; `/books` es la ruta canónica y su primera pestaña es “Todos”.
- Mantener “Todos” como superset de los libros propios de la sesión y usar historias persistidas como formato social de Comunidad.
- Añadir una prueba automatizada de navegador para login, `/messages`, bot persistido y recarga.
- Consolidar una única experiencia de mensajería y retirar gradualmente el canal global legacy.
- Añadir observabilidad de errores de API, reconexiones y latencia de persistencia.

## Después

- Revisar permisos, bloqueo y retención de mensajes con criterios de privacidad.
- Documentar despliegue reproducible y rollback de migraciones.
- Automatizar validación de enlaces Markdown, variables documentadas y nombres de migración.

Toda nueva iniciativa debe entrar primero en `docs/backlog.md` y, si tiene alcance técnico, en un OpenSpec.
