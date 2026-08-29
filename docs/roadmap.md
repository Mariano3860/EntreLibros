# Hoja de ruta

Este roadmap separa la recuperación terminada de las siguientes decisiones de producto.

## Trabajo diferido fuera de `complete-entrelibros-recovery`

Estas ideas se conservan como dirección futura, no como tareas pendientes del MVP. Cada una deberá tener una OpenSpec propia antes de implementarse:

- `post-mvp-trust-safety`: denuncias, moderación, reputación, ratings y flujo posterior al intercambio.
- `post-mvp-platform-hardening`: rate limiting avanzado, recuperación de contraseña, observabilidad y retención/exportación de datos.
- `post-mvp-production-integrations`: proveedores reales de email/storage, malware scanning y operaciones avanzadas.
- `post-mvp-community-insights`: estadísticas persistentes, sugerencias y crecimiento comunitario.

## Próximo

- Añadir una prueba automatizada de navegador para login, `/messages`, bot persistido y recarga.
- Consolidar una única experiencia de mensajería y retirar gradualmente el canal global legacy.
- Añadir observabilidad de errores de API, reconexiones y latencia de persistencia.

## Después

- Revisar permisos, bloqueo y retención de mensajes con criterios de privacidad.
- Documentar despliegue reproducible y rollback de migraciones.
- Automatizar validación de enlaces Markdown, variables documentadas y nombres de migración.

Toda nueva iniciativa debe entrar primero en `docs/backlog.md` y, si tiene alcance técnico, en un OpenSpec.
