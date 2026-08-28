## 1. Auditoría y fuentes de verdad

- [ ] 1.1 Inventariar todos los `AGENTS.md`, README, archivos `docs/`, comentarios relevantes y artefactos OpenSpec, clasificando audiencia, autoridad, fecha y duplicaciones; verificar el inventario con `rg --files`.
- [ ] 1.2 Comparar cada afirmación operativa con `package.json`, scripts, configuración Rsbuild/Vitest, Dockerfiles, workflows, migraciones y código; registrar contradicciones y pendientes en un checklist auditable.
- [ ] 1.3 Definir en la documentación la precedencia entre instrucciones raíz, agentes anidados, README, docs y OpenSpec; verificar que no existan reglas contradictorias.

## 2. Instrucciones para agentes

- [ ] 2.1 Actualizar `AGENTS.md` raíz con comandos reales, ramas/merge, límites de autoridad, uso de herramientas, validaciones y manejo de cambios documentales; verificarlo contra los scripts disponibles.
- [ ] 2.2 Revisar y actualizar `backend/AGENTS.md` y crear instrucciones locales solo donde aporten reglas específicas para backend, migraciones, tests o base de datos; verificar que sean aditivas y no contradictorias.
- [ ] 2.3 Crear o actualizar instrucciones locales para `frontend/`, `docs/` y `scripts/` cuando corresponda, incluyendo formato, pruebas, ownership y criterios de calidad; verificar cobertura de cada área con `rg --files -g 'AGENTS.md'`.
- [ ] 2.4 Documentar en los agentes el protocolo de mantener backlog, OpenSpec, comentarios y runbooks sincronizados; verificar que cada regla sea accionable y tenga un comando o evidencia asociada.

## 3. README y onboarding

- [ ] 3.1 Actualizar `README.md` raíz con arquitectura, prerrequisitos, instalación, variables de entorno, ejecución local, Docker, migraciones, tests, builds y enlaces a documentación; verificar cada comando en los manifests.
- [ ] 3.2 Actualizar `frontend/README.md` con Rsbuild, carga de `.env*`, `PUBLIC_API_BASE_URL`, `PUBLIC_API_USE_MOCKS`, MSW, modo demo, troubleshooting de cache/service worker y verificación de `/messages`; verificar ejemplos contra `rsbuild.config.ts` y `setupMocks.ts`.
- [ ] 3.3 Crear o actualizar `backend/README.md` con Express, PostgreSQL/PostGIS, `DATABASE_URL`, migraciones append-only, auth, Socket.IO, bot, tests y diagnóstico de errores 500; verificar rutas y scripts contra el backend.
- [ ] 3.4 Actualizar `scripts/README.md` y documentación de automatización con los comandos soportados y sus dependencias; verificar que no se documenten comandos inexistentes.

## 4. Documentación técnica y operativa

- [ ] 4.1 Actualizar `docs/arquitectura.md` con límites frontend/backend, proxy, REST, Socket.IO, MSW y persistencia; verificar diagramas y nombres contra el código.
- [ ] 4.2 Actualizar `docs/base_de_datos.md` con el esquema real y las migraciones 010–015, bot, conversaciones, mensajes, acuerdos, bloqueos e invariantes; verificar tablas y columnas contra `backend/migrations/`.
- [ ] 4.3 Ampliar o crear documentación de mensajería que explique conversación normal, cursor/reconexión, autorización de rooms, persistencia antes de emitir, bot y carga de historial; verificar flujo con tests existentes.
- [ ] 4.4 Actualizar `docs/recovery-baseline.md` para separar hechos históricos de estado actual, incluir commits/PR #138, migraciones, bot, mocks y límites de browser E2E; verificar fechas, hashes y conteos contra git y suites.
- [ ] 4.5 Documentar el procedimiento de diagnóstico: pantalla vacía, `GET /api/messages` 500, migraciones faltantes, MSW no activo, cache del bundle, Socket.IO y cookies; verificar que cada síntoma tenga causa, comando y resultado esperado.
- [ ] 4.6 Revisar `docs/messaging-bubbles.md` y documentos relacionados para corregir nombres, estados, acuerdos y enlaces; verificar que no describan fixtures como persistencia real.

## 5. Estado, backlog y roadmap

- [ ] 5.1 Actualizar `docs/backlog.md` con el estado real de mensajería, acuerdos, bot, mocks, recovery, browser E2E y pendientes de producto; verificar que no haya duplicados ni estados incompatibles.
- [ ] 5.2 Crear o consolidar un documento de estado actual del sistema con capacidades terminadas, limitaciones conocidas, evidencia de tests y frontera manual de merge/deploy; verificar enlaces desde los README.
- [ ] 5.3 Crear o consolidar un roadmap de próximos pasos priorizado, separando deuda técnica, producto, seguridad, operación, observabilidad y E2E; verificar que cada pendiente tenga alcance y criterio de cierre.
- [ ] 5.4 Añadir una guía de cómo actualizar documentación después de cambios de código, migraciones, APIs o workflows; verificar que esté enlazada desde `AGENTS.md`.

## 6. Comentarios de código y ejemplos

- [ ] 6.1 Añadir comentarios selectivos en persistencia/concurrencia de mensajería, acuerdos, bot y migraciones para explicar invariantes y decisiones no obvias; verificar que no repitan literalmente la implementación.
- [ ] 6.2 Documentar en código la frontera entre mocks/demo, servicio real, Socket.IO legacy y conversación persistida; verificar que los comentarios coincidan con tests y configuración.
- [ ] 6.3 Revisar comentarios, nombres y ejemplos de variables de entorno para eliminar referencias obsoletas o ambiguas; verificar con `rg` que no queden nombres antiguos.

## 7. Validación y entrega documental

- [ ] 7.1 Ejecutar validación de formato Markdown/Prettier y corregir errores; verificar con los comandos de formato del repositorio.
- [ ] 7.2 Verificar enlaces internos, referencias a archivos, comandos, rutas, nombres de migración y variables; entregar un reporte de referencias rotas y comprobar que las correcciones queden aplicadas.
- [ ] 7.3 Ejecutar `openspec validate refresh-repository-documentation --type change --strict --no-interactive` y verificar que el cambio documental sea válido con `skip_specs: true`.
- [ ] 7.4 Revisar el diff completo por audiencia y hacer una lectura manual de consistencia; verificar que no se hayan modificado runtime, APIs, dependencias ni datos.
- [ ] 7.5 Actualizar el backlog y el índice de documentación como última operación; verificar enlaces de navegación y estado final.
- [ ] 7.6 Crear commits incrementales por área documental, comprobar `git status --short` limpio y entregar resumen de archivos, decisiones, limitaciones y próximos pasos; no realizar merge.
