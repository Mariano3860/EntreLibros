# TFG Traceability

El TFG usa el vocabulario de publicaciones oferta/búsqueda, Rincones, mapa,
mensajería, acuerdos, PostgreSQL/PostGIS y React/Express. El código y las
pruebas son la fuente de verdad para afirmar implementación; el PDF aporta
contexto y requisitos académicos.

| Área | Implementación y evidencia | Límite declarado |
| --- | --- | --- |
| Identidad y perfil | rutas auth/user, `userRepository`, pruebas API/E2E | MFA y recuperación avanzada no están implementados. |
| Libros y publicaciones | libros/listings, `PublishBookModal`, pruebas de publicación | ratings/reseñas persistentes no son un dominio actual. |
| Rincones y mapa | `/api/map`, PostGIS, `MapPage`, pruebas map | pines representan Rincones; no cada publicación. |
| Intercambio | drafts, mensajes, acuerdos, outcomes y E2E | la coordinación no sustituye validación física del encuentro. |
| Privacidad | DTO público, bloqueos, precisión geográfica y tests | TLS, backups y controles de infraestructura dependen del despliegue. |
| Verificación | Vitest, MSW, backend, service E2E, Playwright y CI | revisión manual de accesibilidad/viewport debe repetirse en entrega. |

La arquitectura AWS/S3/OpenID y varios controles de seguridad descritos por el
texto académico se tratan como objetivo o contexto salvo evidencia del runtime
actual. Consulta [Architecture](architecture.md), [Testing](testing.md) y
[Security and Privacy](security-and-privacy.md).
