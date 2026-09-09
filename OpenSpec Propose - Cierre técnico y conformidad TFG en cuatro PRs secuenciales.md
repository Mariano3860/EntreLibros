Quiero crear UN OpenSpec Propose que agrupe las siguientes cuatro etapas de trabajo sobre EntreLibros:

1. Baseline + trazabilidad defendible
2. Conformidad funcional TFG
3. Cleanup residual
4. Convergencia del protocolo de mensajería

Estas cuatro etapas pertenecen al mismo programa de cierre técnico previo a la presentación del TFG, pero NO deben implementarse juntas.

La ejecución debe hacerse obligatoriamente mediante:

**4 etapas secuenciales → 4 branches independientes → 4 PRs independientes**

y debe existir una pausa obligatoria entre cada PR.

---

# REGLA DE EJECUCIÓN MÁS IMPORTANTE

NO trabajar las cuatro etapas en una única branch.

NO abrir una PR gigante.

NO continuar automáticamente después de abrir una PR.

El procedimiento obligatorio es:

1. partir del `main` actualizado;
2. crear una branch exclusiva para la etapa actual;
3. implementar únicamente esa etapa;
4. ejecutar todas las verificaciones;
5. revisar el diff;
6. abrir una PR;
7. detener completamente el trabajo;
8. informar al usuario;
9. esperar a que EL USUARIO mergee la PR;
10. NO mergear la PR;
11. NO comenzar la siguiente etapa;
12. cuando el usuario confirme que fue mergeada:
    - volver a `main`;
    - actualizar `main`;
    - verificar el nuevo estado;
    - crear la branch de la siguiente etapa;
    - continuar.

El usuario es el único que realiza merges.

Nunca asumir que una PR fue mergeada.

Nunca comenzar una nueva etapa desde la branch anterior.

Cada etapa debe partir del `main` que contenga las etapas anteriores ya mergeadas.

---

# FUENTES PRINCIPALES

Usar como contexto:

`docs/tfg-system-compliance-explore.md`

y el estado actual del repositorio.

También revisar:

- `docs/technical-simplification-explore.md`
- `docs/tfg-mvp-trazabilidad.md`
- `docs/estado-actual.md`
- `docs/arquitectura.md`
- `docs/e2e-baseline.md`
- `docs/recovery-baseline.md`
- `docs/security-runbook.md`
- `backend/openapi.json`
- tests backend/frontend
- Playwright E2E
- migraciones
- CI
- todos los `AGENTS.md` aplicables

El TFG completo está en:

`C:\REPOS\EntreLibros\TFG ULTIMA VERSION - ROJO - MARIANO.pdf`

Usarlo especialmente cuando una decisión dependa de un requisito académico.

---

# REVALIDACIÓN OBLIGATORIA

Los informes Explore fueron generados sobre estados anteriores del repositorio.

Antes de implementar CADA etapa:

1. actualizar `main`;
2. leer el estado actual;
3. revisar si los hallazgos siguen vigentes;
4. descartar problemas ya solucionados;
5. detectar si una PR anterior cambió el contexto;
6. no implementar una recomendación simplemente porque figure en un informe antiguo.

Código, tests y migraciones actuales tienen prioridad para determinar qué existe realmente.

---

# OPEN SPEC

Quiero que inicialmente generes los artifacts de OpenSpec para este programa completo.

Debe quedar dividido explícitamente en cuatro fases.

Cada fase debe contener:

- objetivo;
- alcance;
- non-goals;
- hallazgos relacionados;
- estrategia;
- riesgos;
- tests;
- criterios de aceptación;
- branch sugerida;
- condición necesaria para empezar;
- condición necesaria para terminar.

La implementación posterior debe respetar estrictamente esos límites.

---

# FASE 1 - BASELINE + TRAZABILIDAD DEFENDIBLE

## Objetivo

Dejar una base técnica confiable y una única versión verificable de qué está implementado.

Esta fase debe resolver problemas que actualmente dificultan distinguir:

- una regresión real;
- un fallo del entorno;
- documentación vieja;
- comportamiento realmente implementado.

## Branch sugerida

`chore/tfg-baseline-and-traceability`

Crear esta branch exclusivamente desde el `main` actualizado.

---

## 1. Tests frontend

Investigar y corregir los problemas detectados por el Explore donde los asserts pueden pasar pero el proceso termina con errores no controlados como:

`read EINVAL`

y warnings relevantes relacionados con:

- MSW;
- jsdom;
- requests abiertas;
- lifecycle;
- timers;
- sockets mock;
- `act(...)`.

No ocultar errores.

No capturar excepciones globalmente simplemente para conseguir exit code 0.

Encontrar la causa real.

El objetivo es que la suite termine limpiamente.

---

## 2. DB de tests backend

Actualmente se detectó migration hash drift en bases históricas de test.

Resolver el problema mediante una estrategia reproducible.

Principios obligatorios:

- NO modificar migraciones ya aplicadas;
- NO cambiar hashes;
- NO editar `031`, `032`, `033`, etc. para que coincidan con una DB vieja;
- NO borrar silenciosamente una DB del usuario sin necesidad.

Preferir:

- base aislada;
- lifecycle reproducible;
- reset controlado;
- estrategia equivalente a la usada por E2E si resulta apropiada.

El objetivo debe ser:

`npm run test:backend`

reproducible desde un entorno correctamente configurado.

---

## 3. Trazabilidad TFG

Actualizar:

`docs/tfg-mvp-trazabilidad.md`

para que exista una única sección claramente identificada como:

**estado actual**

con:

- fecha;
- commit;
- nivel de evidencia;
- estado funcional.

El histórico puede conservarse, pero debe quedar inequívocamente marcado como histórico.

No quiero dos tablas que parezcan describir simultáneamente el estado actual.

---

## 4. Auditoría TFG actualizada

Actualizar o ajustar:

`docs/tfg-system-compliance-explore.md`

solo cuando sea necesario para reflejar el `main` real.

Especialmente eliminar o corregir referencias a branches/PRs que ya estén mergeadas.

No rehacer toda la auditoría si no es necesario.

---

## 5. OpenAPI

Revisar drift entre API implementada y:

`backend/openapi.json`

Corregir únicamente inconsistencias verificadas.

Ejemplo conocido a investigar:

`GET /api/auth/me`

No agregar endpoints inexistentes ni rediseñar el contrato.

---

## 6. Documentación técnica claramente incorrecta

Corregir inconsistencias evidentes y pequeñas, como:

- eventos Socket documentados que ya no existen;
- estado actual versus target;
- referencias obsoletas derivadas del cleanup reciente.

No hacer todavía el gran Project Tour.

---

## Verificación Fase 1

Ejecutar como mínimo:

`npm run verify:ci`

y cualquier verificación específica necesaria.

La etapa NO está terminada si:

- frontend termina con errores no controlados;
- backend tests no son reproducibles;
- existe un fallo nuevo;
- la documentación principal sigue contando estados incompatibles.

---

## Final de Fase 1

Abrir PR.

Incluir en la descripción:

- qué problemas de baseline se encontraron;
- cómo se resolvieron;
- qué documentación se actualizó;
- suites ejecutadas;
- resultado de `npm run verify:ci`.

Después:

**STOP.**

No crear la branch de Fase 2.

No modificar más código.

Esperar explícitamente a que el usuario diga que la PR fue mergeada.

---

# FASE 2 - CONFORMIDAD FUNCIONAL TFG

Esta fase comienza ÚNICAMENTE después de que el usuario confirme el merge de Fase 1.

Volver a:

`main`

actualizarlo y comprobar que contiene Fase 1.

## Branch sugerida

`fix/tfg-functional-compliance`

---

# Alcance de Fase 2

Quiero resolver solamente:

1. política de password;
2. coherencia mapa/lista.

NO quiero todavía abordar:

- filtros de género/tema;
- moderación humana;
- editorial avanzada.

---

# 1. PASSWORD

Existe una inconsistencia identificada entre:

- frontend;
- backend;
- HU del TFG;
- sección de seguridad del TFG.

El backend aplica actualmente una política más estricta que parte del frontend.

Quiero una única política visible y consistente.

## Criterio

Preferir la política actual más segura del backend, salvo que el análisis actual demuestre una razón fuerte en contra.

Frontend y backend deben:

- validar lo mismo;
- comunicarlo igual;
- tener mensajes claros;
- disponer de tests equivalentes.

No reducir seguridad únicamente para imitar literalmente el criterio más antiguo del TFG.

Documentar que la implementación cumple o supera el criterio mínimo académico.

---

# 2. MAPA / LISTA

Este es el gap funcional principal identificado respecto de HU-4.2.

Revisar nuevamente el estado actual.

El Explore encontró aproximadamente:

- backend capaz de devolver Rincones/publicaciones/actividad;
- `MapCanvas` capaz de representar publicaciones;
- `MapPage` con publications desactivadas;
- lista y mapa que no representan necesariamente el mismo conjunto.

## Objetivo

Definir un comportamiento simple y defendible que satisfaga razonablemente:

> mapa y listado representan de forma coherente los resultados explorados.

No implementar literalmente el prototipo viejo si la UX actual evolucionó.

Primero comprender la arquitectura actual del mapa.

Después realizar el cambio mínimo necesario.

## Requisitos

Preservar:

- bbox;
- radius;
- geolocation;
- privacidad;
- aproximación de coordenadas;
- filtros actuales;
- rendimiento;
- límite/truncated;
- diseño visual actual.

No reescribir `MapPage`.

No hacer un refactor estructural grande en esta fase.

Esta es una corrección de contrato funcional.

---

# Tests Fase 2

Agregar o ajustar tests que demuestren:

## Password

- frontend;
- backend;
- mensajes coherentes;
- registro real.

## Map

E2E/Playwright cuando corresponda para demostrar:

- mapa y representación/listado coherentes;
- selección;
- detalle;
- comportamiento con los filtros relevantes;
- privacidad preservada.

No crear E2E para detalles internos.

---

# FUERA DE ALCANCE FASE 2

NO implementar:

- género;
- tema;
- nueva taxonomía;
- sistema de moderadores;
- consola de moderación;
- reglas editoriales avanzadas;
- reviews;
- ratings;
- AWS;
- backups;
- email;
- MFA.

Registrar esos puntos como follow-up si siguen vigentes.

---

# Final de Fase 2

Ejecutar:

`npm run verify:ci`

Abrir PR.

Explicar:

- qué inconsistencia de password quedó resuelta;
- cómo se satisface HU-4.2;
- qué comportamiento del mapa se preservó;
- E2E/tests nuevos;
- qué gaps TFG siguen deliberadamente fuera de alcance.

Después:

**STOP.**

Esperar al usuario.

No comenzar Fase 3.

---

# FASE 3 - CLEANUP RESIDUAL

Comenzar únicamente después del merge confirmado de Fase 2.

Actualizar `main`.

## Branch sugerida

`chore/remove-residual-dead-code`

---

# IMPORTANTE

Esta fase puede resultar mucho más pequeña de lo esperado.

Las PRs anteriores ya eliminaron una gran cantidad de código muerto.

NO asumir que los candidatos del Explore siguen existiendo.

NO inventar cleanup para justificar esta fase.

---

# Investigación previa

Volver a buscar consumidores de los candidatos señalados, incluyendo aproximadamente:

Frontend:

- `fetchAllBooks`;
- `fetchBookById`;
- `createWantFromBook`;
- `useBooks`;
- `useUserBooks`;

Backend:

- `createBook`;
- `listBooks`;
- `sendMessage`;
- `areUsersBlocked`;
- `withMessagingClient`;

y cualquier cadena directamente asociada.

Estos nombres son candidatos históricos, NO una orden de borrado.

---

# Para cada candidato comprobar

- imports productivos;
- imports indirectos;
- exports;
- barrels;
- dynamic imports;
- routing;
- tests;
- scripts;
- tooling;
- configuración;
- CI;
- MSW;
- backend;
- Socket.IO.

---

# Regla de eliminación

Eliminar algo solamente si puede demostrarse que:

1. no tiene consumidor productivo;
2. no forma parte de un contrato externo vigente;
3. sus tests protegen solamente la implementación muerta;
4. cualquier regla de negocio útil fue trasladada previamente al flujo canónico;
5. build/typecheck/tests siguen verdes.

Eliminar cadenas completas, no dejar:

- test huérfano;
- export huérfano;
- helper huérfano;
- tipo huérfano.

---

# Si ya está resuelto

Si al revisar `main` los candidatos ya:

- fueron eliminados;
- tienen consumidores reales;
- o no existe suficiente evidencia para retirarlos;

NO crear cambios artificiales.

En ese caso:

- documentar la conclusión;
- limitar esta fase a cualquier cleanup residual inequívoco realmente encontrado.

Si absolutamente no existe ningún cambio justificable, informar al usuario que la fase es un **no-op confirmado** y detenerse.

NO fabricar una PR vacía ni modificar archivos solo para tener una PR.

Esperar instrucción del usuario antes de avanzar a Fase 4.

---

# Final de Fase 3

Si existen cambios reales:

- ejecutar tests;
- `npm run verify:ci`;
- búsqueda negativa final de símbolos eliminados;
- abrir PR;
- STOP;
- esperar merge del usuario.

Si no existen cambios:

- entregar informe de no-op;
- STOP;
- esperar aprobación explícita para comenzar Fase 4.

---

# FASE 4 - CONVERGENCIA DEL PROTOCOLO DE MENSAJERÍA

Comenzar únicamente después:

- del merge de la PR de Fase 3;
- o de aprobación explícita del usuario si Fase 3 fue no-op.

Actualizar `main`.

## Branch sugerida

`refactor/converge-message-write-protocol`

---

# Objetivo

Resolver cuidadosamente la ambigüedad actual entre:

- HTTP;
- Socket.IO;

en el camino de escritura de mensajes.

NO rediseñar toda la mensajería.

NO dividir todavía `MessagesPage.tsx` como objetivo principal.

Primero quiero una única verdad clara sobre:

> cómo se escribe/persiste un mensaje y cómo se distribuye en tiempo real.

---

# Estado observado a revalidar

El Explore identificó aproximadamente:

### Browser productivo

- crea/actualiza drafts por HTTP;
- envía el draft final por HTTP;
- backend persiste;
- después emite evento;
- Socket.IO entrega/invalida/replay.

### Paralelamente

Backend todavía puede recibir:

`conversation:message`

desde Socket.IO y persistir directamente por otro camino.

También pueden existir:

- `conversation:read` vía Socket;
- bot asociado al write path;
- exports frontend sin consumidores;
- tests que ejercitan ese protocolo.

NO asumir que esto sigue exactamente igual.

Revalidar desde `main`.

---

# Decisión de diseño deseada

Preferir, si el comportamiento actual del navegador y las pruebas lo respaldan:

**HTTP como comando de escritura/persistencia**

y

**Socket.IO como canal de eventos, entrega en tiempo real, replay e invalidación**

porque ese parece ser el flujo productivo actual.

Pero NO imponer esta decisión sin analizar:

- bot;
- tests;
- consumidores externos;
- reconexión;
- idempotencia;
- delivery;
- read receipts;
- acuerdos;
- notificaciones.

---

# Objetivo técnico

Quiero evitar tener dos caminos independientes que implementen:

- validación;
- persistencia;
- notificación;
- bot;
- emisión;
- idempotencia;

de maneras potencialmente divergentes.

La convergencia puede resolverse de dos formas válidas:

### Opción A

Retirar el write protocol Socket que no tenga consumidores reales.

### Opción B

Mantener ambos transportes pero hacer que ambos deleguen en UNA misma operación canónica de persistencia/delivery.

Elegir la opción más simple basada en consumidores reales y comportamiento esperado.

No mantener duplicación solo por compatibilidad imaginaria.

---

# Socket.IO que debe preservarse

No eliminar accidentalmente:

- autenticación Socket;
- rooms;
- `conversation:join`;
- receive `conversation:message`;
- replay por cursor;
- `agreement:updated`;
- reconexión;
- invalidación React Query;
- entrega entre usuarios;
- notificaciones relacionadas.

---

# Bot

Revisar explícitamente el comportamiento del bot.

Determinar:

- si sigue siendo funcionalidad productiva;
- por qué camino recibe mensajes;
- si depende del write protocol Socket;
- si puede reutilizar la operación canónica.

No eliminarlo accidentalmente.

Si la decisión sobre bot es realmente de producto y no puede inferirse del proyecto, detener esa parte y solicitar decisión al usuario antes de eliminarlo.

---

# Read state

Revisar:

`conversation:read`

y comparar Socket vs HTTP.

Si el navegador ya tiene un camino canónico HTTP y no hay consumidores del Socket write:

considerar su retiro.

Pero preservar la semántica de unread/read.

---

# Idempotencia

Este cambio debe mejorar o preservar claramente:

- `clientKey`;
- deduplicación;
- replay;
- persistencia;
- no doble entrega.

Agregar characterization tests ANTES de modificar comportamiento sensible si falta cobertura.

---

# Tests obligatorios Fase 4

Cubrir como mínimo:

## Dos usuarios reales

Usuario A envía mensaje.

Usuario B lo recibe sin reload.

## Persistencia

Reload mantiene el mensaje.

## Reconnect

Mensajes perdidos durante desconexión se recuperan si el sistema promete replay.

## Idempotencia

El mismo comando no genera mensajes duplicados.

## Draft send

El flujo actual sigue funcionando.

## Notifications

El receptor conserva notificación/unread.

## Agreement interaction

Los eventos de acuerdo continúan actualizando el chat.

## Bot

Si se conserva, probar el camino canónico.

---

# Restricciones Fase 4

NO:

- reescribir `MessagesPage`;
- cambiar UX;
- cambiar bubbles;
- cambiar acuerdos;
- cambiar draft model;
- introducir outbox;
- cambiar esquema salvo absolutamente imprescindible;
- editar migraciones aplicadas;
- introducir Kafka/queues;
- reemplazar Socket.IO;
- crear arquitectura distribuida.

La meta es:

**menos protocolos internos, misma funcionalidad.**

---

# Documentación Fase 4

Al finalizar debe quedar inequívocamente explicado:

## Sending

Qué transporte crea/persiste mensajes.

## Realtime delivery

Qué hace Socket.IO.

## Replay

Cómo se recuperan mensajes.

## Notifications

Cómo se disparan.

## Agreements

Cómo llegan sus updates.

## Bot

Cómo entra en el flujo, si sigue existiendo.

Actualizar documentación antigua que describa otro protocolo.

---

# Final de Fase 4

Ejecutar todos los tests relevantes y:

`npm run verify:ci`

Abrir PR.

La descripción debe incluir:

- protocolo anterior;
- protocolo resultante;
- superficie eliminada o consolidada;
- tests de idempotencia/replay/realtime;
- comportamiento preservado;
- riesgos.

Después:

**STOP.**

No mergear.

Esperar al usuario.

---

# REGLAS TRANSVERSALES PARA LAS CUATRO FASES

## Git

Antes de cada fase:

`git status --short`

Debe entenderse el estado antes de modificar nada.

Trabajar siempre desde el `main` actualizado.

Nunca usar comandos destructivos innecesarios.

Nunca modificar trabajo ajeno.

Nunca hacer merge.

---

# Tests como contrato

En cada cambio:

1. identificar comportamiento actual;
2. identificar cobertura;
3. agregar characterization/regression test cuando haga falta;
4. modificar;
5. ejecutar tests locales específicos;
6. ejecutar verificación general.

No cambiar tests para adaptarlos arbitrariamente a una implementación nueva.

---

# Migraciones

Regla absoluta:

**NO editar migraciones ya aplicadas.**

Si alguna evolución futura necesita schema nuevo:

crear migración nueva.

Pero evitar cambios de schema en estas cuatro fases salvo necesidad real.

---

# Comportamiento

Preservar comportamiento observable salvo:

- bug;
- contradicción funcional TFG explícitamente incluida;
- duplicidad de protocolo que esta propuesta autoriza resolver.

No introducir features no solicitadas.

---

# Tamaño de PR

Cada PR debe ser:

- conceptualmente coherente;
- revisable;
- limitada a su fase.

Si dentro de una fase aparece un problema claramente independiente y grande:

NO ampliar silenciosamente el alcance.

Documentarlo como follow-up.

---

# DOCUMENTACIÓN DEL PROGRAMA

El OpenSpec debe mantener un pequeño estado de ejecución de las cuatro fases:

| Phase | Status | Branch | PR | Main commit after merge |
|---|---|---|---|---|

Estados:

- planned
- in_progress
- awaiting_user_merge
- merged
- verified
- no_op

Actualizar esa tabla durante el desarrollo si las convenciones de OpenSpec lo permiten.

---

# CRITERIO FINAL DE ÉXITO

Después de las cuatro fases quiero tener:

### Baseline

- tests confiables;
- DB de tests reproducible;
- CI verde;
- trazabilidad clara.

### TFG

- password coherente;
- HU-4.2 defendible;
- documentación honesta sobre qué está implementado.

### Cleanup

- sin APIs/hooks/repositories test-only inequívocos que ya no tengan función.

### Messaging

- una única política clara de escritura/persistencia;
- Socket.IO con responsabilidad explícita;
- sin duplicación ambigua;
- realtime, replay, drafts, agreements y notifications intactos.

Todo esto debe realizarse sin mezclar las cuatro etapas en una única PR.

---

# PRIMERA ACCIÓN

Ahora:

1. revisar `main`;
2. revisar `docs/tfg-system-compliance-explore.md`;
3. revisar el PDF del TFG cuando sea necesario;
4. generar el OpenSpec Propose completo con estas cuatro fases;
5. NO implementar todavía.

Quiero revisar primero los artifacts del OpenSpec.

Una vez aprobado el Propose, comenzar únicamente por Fase 1.

Y recordar durante todo el programa:

**branch → implementación → tests → PR → STOP → usuario mergea → actualizar main → siguiente branch.**