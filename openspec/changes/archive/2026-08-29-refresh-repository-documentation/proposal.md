## Por qué

La documentación del repositorio quedó desalineada después de los cambios de recuperación de PR #138, la persistencia de mensajería/acuerdos, el bot persistido y la configuración de mocks con Rsbuild. Hay instrucciones, README y documentos técnicos que describen estados anteriores, omiten decisiones operativas importantes o no explican cómo verificar el sistema actual.

Este cambio establece una base documental única y mantenible para que colaboradores y agentes puedan entender cómo ejecutar, probar, depurar y continuar el proyecto sin depender del historial del chat.

## Qué cambia

- Auditar y actualizar `AGENTS.md` y los `AGENTS.md` anidados para reflejar el flujo real de trabajo, límites de autoridad, comandos, convenciones y zonas de responsabilidad.
- Revisar los README raíz, frontend, backend y scripts: instalación, variables de entorno, desarrollo, migraciones, tests, builds, despliegue y troubleshooting.
- Corregir documentación técnica desactualizada o contradictoria en `docs/`, incluyendo arquitectura, base de datos, mensajería, recovery y backlog.
- Documentar el estado actual: PR #138, commits relevantes, migraciones 010–015, mensajería persistida, acuerdos versionados, bot, mocks MSW y límites de E2E.
- Agregar comentarios de código únicamente donde expliquen decisiones no obvias, invariantes, límites de seguridad, persistencia, concurrencia o compatibilidad.
- Añadir agentes/instrucciones anidadas donde mejoren la propiedad local de frontend, backend, migraciones, tests, documentación y operaciones, sin duplicar reglas contradictorias.
- Documentar el roadmap: qué está terminado, qué queda pendiente y cómo validar cada área.
- Incorporar una revisión final de enlaces, comandos, rutas, nombres de variables, ejemplos y consistencia entre documentos.

## Capacidades

### Capacidades nuevas

<!-- No se introducen capacidades funcionales. Este cambio es documental y usa skip_specs: true. -->

### Capacidades modificadas

<!-- No se modifican requisitos funcionales. -->

## Impacto

- Archivos de instrucciones del repositorio y agentes anidados.
- `README.md`, `frontend/README.md`, `backend/README.md` si existe o debe incorporarse, y `scripts/README.md`.
- Documentación en `docs/` y entradas del backlog.
- Comentarios seleccionados en código TypeScript, SQL y scripts, sin cambiar comportamiento.
- Artefactos OpenSpec del propio cambio.
- No se esperan cambios en APIs, base de datos, dependencias ni comportamiento ejecutable.
