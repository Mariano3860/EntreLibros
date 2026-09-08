## 1. Fase 1 - Baseline y trazabilidad defendible

- [x] 1.1 Volver a leer los AGENTS.md aplicables, registrar `git status --short`, confirmar el `main` de entrada y crear `chore/tfg-baseline-and-traceability`; verificar que la branch parte del `main` actualizado y que no se arrastra trabajo no relacionado.
- [x] 1.2 Capturar el baseline de Node/npm, configuración de entorno, comandos canónicos y estado de migraciones; verificar que el registro identifica commit, base de datos objetivo y cualquier limitación previa antes de editar.
- [x] 1.3 Reproducir los errores no controlados `read EINVAL` y warnings `act(...)` con tests focalizados de MSW/jsdom, requests abiertas, timers y sockets mock; verificar que cada error queda asociado a un test/lifecycle concreto y que no se agrega supresión global.
- [x] 1.4 Corregir el lifecycle frontend de MSW/jsdom y los warnings de act cuando la causa sea de test; verificar que `npm run test:frontend` termina con exit code cero y sin errores asíncronos no controlados.
- [x] 1.5 Definir y documentar un lifecycle seguro para la DB backend de tests, con preflight, aislamiento o reset controlado; verificar que no se modifican migraciones aplicadas ni hashes y que una DB ajena no se borra silenciosamente.
- [x] 1.6 Ejecutar la estrategia de DB limpia/aislada con las migraciones actuales y comprobar `npm run test:backend`; verificar que los tests backend se ejecutan de forma reproducible y que el resultado distingue errores de entorno de fallos de código.
- [x] 1.7 Actualizar `docs/tfg-mvp-trazabilidad.md` con una única sección de estado actual que incluya fecha, commit, nivel E0-E4 y estado funcional; verificar que el histórico queda rotulado y no compite visualmente con el estado actual.
- [x] 1.8 Revalidar `docs/tfg-system-compliance-explore.md` contra el `main` de esta fase y corregir solo referencias de branch/PR/estado ya obsoletas; verificar que no se rehace la auditoría ni se convierten hipótesis en hechos.
- [x] 1.9 Comparar las rutas implementadas con `backend/openapi.json` y corregir únicamente drift confirmado, incluyendo la investigación de `GET /api/auth/me`; verificar método, path y respuesta sin documentar endpoints inexistentes.
- [x] 1.10 Corregir referencias técnicas pequeñas y demostrablemente incorrectas, como eventos Socket.IO no existentes, distinción current/target y referencias del cleanup; verificar enlaces, nombres de eventos y comandos documentados.
- [x] 1.11 Ejecutar tests focalizados, `npm run verify:ci`, revisión manual del diff y `git diff --check`; verificar que frontend, backend, documentación y OpenAPI cumplen el baseline sin fallos nuevos.
- [x] 1.12 Abrir la PR de Fase 1 con resumen en español, evidencia de comandos y resultado de `npm run verify:ci`; verificar que la PR queda abierta y detener el trabajo hasta que el usuario confirme explícitamente el merge.

## 2. Fase 2 - Conformidad funcional TFG

- [x] 2.1 Esperar la confirmación explícita del merge de Fase 1, volver a `main`, actualizarlo y comprobar que contiene el commit de Fase 1; verificar que `fix/tfg-functional-compliance` nace de ese `main` y no de la branch anterior.
- [x] 2.2 Revalidar la política de password en TFG, backend, frontend, mensajes, fixtures, tests y documentación; verificar la decisión documentada de mantener la política segura del backend salvo evidencia fuerte en contrario.
- [x] 2.3 Alinear la validación y el mensaje de password del frontend con el contrato backend decidido, sin reducir seguridad por imitar el criterio antiguo; verificar tests equivalentes de rechazo/aceptación en ambos límites y registro/login real.
- [x] 2.4 Revalidar el contrato actual de mapa/lista de Rincones en MapPage, MapCanvas, API, servicios, mocks, tests, E2E y documentación; verificar que el conjunto lógico es de Rincones y preservar bbox, radius, geolocation, privacidad, filtros, límites y truncated.
- [x] 2.5 Implementar el cambio mínimo para que mapa y listado/panel de Rincones usen el mismo contexto de resultados y selección, sin reescribir MapPage ni activar publications, reemplazar EMPTY_PUBLICATIONS por datos reales o convertir listings en pines; verificar que no se introducen datos mock/stale ni se exponen coordenadas privadas.
- [x] 2.6 Agregar o ajustar tests frontend de password, Rincones mapa/lista, selección, empty, truncation y filtros existentes; verificar que no se espera ninguna publicación individual como pin o capa geográfica.
- [x] 2.7 Ejecutar Playwright/E2E real para Rincones, privacidad, selección y detalle, además de los flujos de autenticación afectados; verificar con PostgreSQL/PostGIS que mapa y listado reflejan coherentemente el conjunto de Rincones y que no aparecen publicaciones individuales como pines.
- [x] 2.8 Ejecutar backend/frontend tests afectados, builds, typecheck, lint, format y `npm run verify:ci`; verificar que el cambio conserva acciones actuales, privacidad y composición visual.
- [x] 2.9 Revisar el diff contra los non-goals de Fase 2 y abrir una PR en español con la política de password, el contrato mapa/lista de Rincones, la separación catálogo/mapa, evidencia E2E y gaps fuera de alcance; verificar estado abierto y detenerse hasta confirmación de merge.

## 3. Fase 3 - Cleanup residual

- [x] 3.1 Esperar confirmación explícita del merge de Fase 2, volver a `main`, actualizarlo y comprobar el commit base; verificar que `chore/remove-residual-dead-code` parte del `main` correcto.
- [x] 3.2 Ejecutar un inventario de consumidores para `fetchAllBooks`, `fetchBookById`, `createWantFromBook`, `useBooks`, `useUserBooks`, `createBook`, `listBooks`, `sendMessage`, `areUsersBlocked` y `withMessagingClient`; verificar source, tests, barrels, aliases, dynamic imports, routing, scripts, tooling, CI, configuración, MSW, backend y Socket.IO.
- [x] 3.3 Clasificar cada candidato como productivo, compartido, test-only inequívoco o incierto; verificar que `fetchUserBooks`, `getBookById`, discovery/suggestions, FeedActions, FeedItem.types, CornersMiniMap y Socket.IO productivo no se marcan muertos por ubicación o nombre.
- [x] 3.4 Revisar tests de cada candidato y trasladar primero cualquier regla de negocio válida al flujo canónico; verificar que la cobertura trasladada pasa antes de eliminar el test o wrapper antiguo.
- [x] 3.5 Eliminar una cadena inequívoca por bloque —símbolo, imports, exports, tipos, mocks, estilos, fixtures y tests exclusivos— únicamente cuando la evidencia negativa y los non-goals lo permitan; verificar cada bloque con búsqueda de consumidores y tests del dominio.
- [x] 3.6 Revisar dependencias npm, assets y traducciones resultantes solo después de las cadenas de código; verificar source, tests, configuración, tooling, `npm ls`, typecheck y build antes de proponer cualquier eliminación.
- [x] 3.7 Ejecutar búsqueda negativa final de símbolos/rutas/eventos retirados, tests afectados, frontend/backend suites y `npm run verify:ci`; verificar que no quedan exports, helpers, fixtures o documentación huérfanos.
- [ ] 3.8 Si no existe ninguna eliminación inequívoca, documentar la Fase 3 como `no_op` confirmado, no crear una PR vacía y detenerse; verificar que el usuario autoriza explícitamente el inicio de Fase 4.
- [x] 3.9 Si existen cambios reales, abrir la PR de Fase 3 en español con cadenas eliminadas, evidencia de consumidores y verificaciones; verificar que la PR queda abierta y detenerse hasta confirmación explícita del merge.

## 4. Fase 4 - Convergencia del protocolo de mensajería

- [x] 4.1 Esperar el merge confirmado de Fase 3 o la autorización explícita posterior a un `no_op`, volver a `main`, actualizarlo y comprobar el commit base; verificar que `refactor/converge-message-write-protocol` no parte de una branch anterior.
- [x] 4.2 Revalidar desde el `main` actual todos los emisores/listeners HTTP y Socket.IO, handlers, tipos, fixtures, tests, bot, read state, drafts, notificaciones, acuerdos, consumidores externos y reconexión; verificar el mapa real del protocolo antes de decidir.
- [x] 4.3 Añadir characterization tests E3/E4 para dos usuarios, persistencia, reload, delivery realtime, replay/reconnect, clientKey/idempotencia, unread, notifications, agreements y bot si existe cobertura insuficiente; verificar el comportamiento actual antes del cambio.
- [x] 4.4 Decidir y registrar en la PR si el write protocol Socket se retira o delega en una operación canónica compartida; verificar que la decisión se basa en consumidores reales y no en compatibilidad imaginaria.
- [x] 4.5 Implementar una única operación canónica de autorización, validación, persistencia, clientKey/idempotencia, side effects y delivery; verificar que HTTP y cualquier transporte Socket necesario no mantienen implementaciones divergentes.
- [x] 4.6 Si el write Socket no tiene consumidores reales, retirar solo esa superficie y su cadena confirmada; si sí tiene consumidores, hacer que delegue en la operación canónica; verificar búsqueda negativa, typecheck y tests del protocolo.
- [x] 4.7 Preservar autenticación Socket, rooms, conversation:join, receive conversation:message, replay, agreement:updated, reconexión, invalidación React Query, drafts, unread/read y notificaciones; verificar cada superficie con tests de regresión.
- [x] 4.8 Revisar explícitamente el bot: conservarlo y conectarlo a la operación canónica si forma parte del producto; detener la eliminación y solicitar decisión del usuario si su destino no puede inferirse del repositorio; verificar persistencia y entrega cuando se conserve.
- [x] 4.9 Ejecutar la matriz E2E de dos usuarios, reload, desconexión/reconexión, reintento idempotente, draft send, notifications, agreement interaction y bot; verificar ausencia de duplicados y convergencia con el historial persistido.
- [x] 4.10 Actualizar la documentación de mensajería para explicar Sending, Realtime delivery, Replay, Notifications, Agreements y Bot, diferenciando HTTP, Socket.IO y límites actuales; verificar que no quedan descripciones del protocolo anterior.
- [x] 4.11 Ejecutar suites focalizadas, backend/frontend tests, Playwright, builds, typecheck, lint, format y `npm run verify:ci`; verificar que no se modificaron UX, acuerdos, schema, migraciones ni el objetivo estructural de MessagesPage.
- [x] 4.12 Abrir la PR de Fase 4 en español con protocolo anterior/resultante, superficie retirada/consolidada, pruebas de idempotencia/replay/realtime y riesgos; verificar que la PR queda abierta y detenerse sin mergear.

## 5. Gates y cierre del programa

- [ ] 5.1 Tras cada PR, registrar branch, PR, commit de `main` requerido y estado `awaiting_user_merge` o `no_op`; verificar que no se inicia otra fase sin la confirmación indicada.
- [ ] 5.2 Antes de declarar el programa completado, comparar las cuatro PRs mergeadas con sus artifacts, ejecutar la verificación general sobre el `main` final y revisar `git status --short`; verificar que el estado final coincide con las specs y que los follow-ups fuera de alcance permanecen documentados.
