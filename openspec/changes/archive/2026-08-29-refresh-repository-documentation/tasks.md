## 1. Auditoría y fuentes de verdad

- [x] 1.1 Inventariar AGENTS, README, docs, comentarios y OpenSpec con `rg`.
- [x] 1.2 Comparar afirmaciones operativas con manifests, configuración, migraciones, workflows y código; registrar contradicciones.
- [x] 1.3 Definir la precedencia entre agentes, README, docs y OpenSpec.

## 2. Instrucciones para agentes

- [x] 2.1 Actualizar `AGENTS.md` raíz con comandos, ramas, merge, herramientas y validaciones.
- [x] 2.2 Actualizar `backend/AGENTS.md` con reglas de backend, migraciones, tests y base de datos.
- [x] 2.3 Crear instrucciones locales para `frontend/`, `docs/` y `scripts/`.
- [x] 2.4 Documentar sincronización de backlog, OpenSpec, comentarios y runbooks.

## 3. README y onboarding

- [x] 3.1 Actualizar `README.md` raíz con instalación, variables, ejecución, migraciones, tests y enlaces.
- [x] 3.2 Actualizar `frontend/README.md` con Rsbuild, variables públicas, MSW, bot y diagnóstico.
- [x] 3.3 Crear `backend/README.md` con API, PostgreSQL, migraciones, auth, Socket.IO y bot.
- [x] 3.4 Actualizar `scripts/README.md` con comandos soportados, dependencias y límites.

## 4. Documentación técnica y operativa

- [x] 4.1 Actualizar `docs/arquitectura.md` con límites frontend/backend, proxy, REST, Socket.IO, MSW y persistencia.
- [x] 4.2 Actualizar `docs/base_de_datos.md` con migraciones 010–015, bot, mensajes, acuerdos y bloqueos.
- [x] 4.3 Ampliar `docs/messaging-bubbles.md` con flujo, reconexión, persistencia antes de emitir, bot e historial.
- [x] 4.4 Actualizar `docs/recovery-baseline.md` para separar historia de estado actual.
- [x] 4.5 Crear `docs/troubleshooting.md` para pantalla vacía, 500, migraciones, MSW, caché, Socket.IO y cookies.
- [x] 4.6 Revisar nombres, estados, acuerdos y enlaces de mensajería.

## 5. Estado, backlog y roadmap

- [x] 5.1 Actualizar `docs/backlog.md` con el estado real de mensajería y bot.
- [x] 5.2 Crear `docs/estado-actual.md` con capacidades, límites y evidencia.
- [x] 5.3 Crear `docs/roadmap.md` con próximos pasos priorizados.
- [x] 5.4 Crear `docs/guia-documentacion.md` y enlazarla desde los agentes/README.

## 6. Comentarios de código y ejemplos

- [x] 6.1 Añadir comentarios selectivos sobre concurrencia, persistencia y bot.
- [x] 6.2 Documentar la frontera entre mock, servicio real, Socket.IO legacy y conversación persistida.
- [x] 6.3 Revisar comentarios y ejemplos de variables de entorno obsoletos o ambiguos.

## 7. Validación y entrega documental

- [x] 7.1 Ejecutar formato Markdown/Prettier y corregir errores.
- [x] 7.2 Verificar enlaces, archivos, comandos, rutas, migraciones y variables; reportar referencias rotas.
- [x] 7.3 Ejecutar validación estricta de OpenSpec.
- [x] 7.4 Revisar el diff completo y confirmar que no haya cambios runtime/API/dependencias/datos accidentales.
- [x] 7.5 Actualizar backlog e índice como última operación.
- [x] 7.6 Crear commits incrementales, confirmar status limpio y no hacer merge.
