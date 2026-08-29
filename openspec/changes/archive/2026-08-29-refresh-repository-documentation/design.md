## Contexto

El repositorio es un monorepo con frontend React/Rsbuild, backend Node/Express/PostgreSQL/PostGIS y workflows OpenSpec. La documentación se encuentra repartida entre instrucciones raíz y anidadas, README, `docs/`, comentarios inline y artefactos de cambios. El recovery reciente añadió migraciones, mensajería persistida, acuerdos versionados, Socket.IO, MSW opt-in, un bot persistido y nuevos límites de verificación, pero varios documentos todavía reflejan estados históricos.

## Objetivos y exclusiones

**Objetivos:**

- Crear una fuente documental coherente sobre cómo trabajar, ejecutar, probar, desplegar y diagnosticar el repositorio.
- Separar claramente estado actual, decisiones históricas, pendientes y roadmap.
- Hacer que las instrucciones para agentes sean locales, no contradictorias y accionables.
- Documentar los flujos reales de mensajería, acuerdos, bot, migraciones, mocks, E2E y recovery.
- Verificar ejemplos, comandos, enlaces internos, nombres de archivos y afirmaciones técnicas contra el código.

**Exclusiones:**

- Cambiar comportamiento ejecutable, APIs, esquema de base de datos o dependencias.
- Reescribir toda la documentación histórica si puede conservarse como contexto, aunque sí se marcará como histórica y se corregirán contradicciones.
- Sustituir OpenSpec por otra herramienta de planificación.
- Prometer browser E2E cuando el entorno o el repositorio solo ofrecen pruebas de servicio, integración o RTL.

## Decisiones

- **Inventario primero:** clasificar archivos por audiencia y autoridad antes de editar para evitar duplicar reglas. `AGENTS.md` gobernará el trabajo; README explicará onboarding; `docs/` contendrá arquitectura, operación y decisiones; OpenSpec conservará el plan del cambio.
- **Documentar hechos verificables:** cada comando, ruta, variable, migración y estado se contrastará con scripts, package manifests, configuración, tests o git. Las limitaciones se expresarán explícitamente.
- **Capas de agentes:** mantener reglas globales en raíz y añadir instrucciones anidadas solo donde cambien las prácticas locales (frontend, backend, migraciones/tests, documentación). Las reglas específicas podrán ampliar, pero no contradecir, la raíz.
- **Estado y roadmap separados:** crear o consolidar un documento de estado actual y otro de roadmap/pendientes, enlazados desde los README, para que el historial no se confunda con trabajo pendiente.
- **Comentarios con propósito:** comentar invariantes, decisiones de seguridad/concurrencia/persistencia y puntos de integración; no añadir comentarios que repitan el código.
- **Validación documental automatizable:** incluir comandos o scripts de comprobación cuando sean baratos y fiables (enlaces locales, referencias a archivos, comandos declarados y formato), complementados por una revisión manual de exactitud.
- **Sin cambios funcionales:** la implementación deberá limitarse a Markdown, AGENTS y comentarios; si la auditoría revela una corrección de código necesaria, se registrará como pendiente separada y no se incorporará silenciosamente.

## Riesgos y compromisos

- [La documentación puede volver a quedar obsoleta] → enlazar cada área con sus comandos/tests y añadir una checklist de actualización a los agentes.
- [Demasiados agentes pueden crear conflicto] → mantener pocos archivos, declarar precedencia y usar instrucciones locales solo para diferencias reales.
- [Los documentos históricos contienen afirmaciones válidas para su momento] → conservarlos con fecha/alcance explícitos y enlazar el estado actual corregido.
- [Los comandos dependen de Windows, Docker o variables locales] → documentar prerrequisitos, variantes PowerShell/bash y fallos esperables sin incluir secretos.
- [La revisión puede descubrir cambios fuera del alcance documental] → registrar esos hallazgos como pendientes y no modificar runtime en este cambio.

## Plan de migración

1. Auditar el repositorio y producir un mapa de documentación y contradicciones.
2. Actualizar instrucciones, README y documentos técnicos por grupos revisables.
3. Añadir comentarios y agentes locales solo después de fijar la fuente de autoridad.
4. Ejecutar validaciones de formato, enlaces, referencias y coherencia; revisar `git diff` completo.
5. Actualizar backlog y registrar el estado final, limitaciones y próximos pasos.

No hay migración de datos ni rollback de runtime. El rollback consiste en revertir los commits documentales individuales; los commits se mantendrán separados por área.

## Preguntas abiertas

No quedan preguntas que cambien el alcance o el enfoque. Durante la auditoría se podrán decidir nombres concretos de archivos nuevos siempre que respeten esta estructura y no creen duplicados.
