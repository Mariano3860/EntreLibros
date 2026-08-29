> ## Puerta de alcance (obligatoria)
>
> El TFG final local es el contrato mínimo del producto. Durante esta entrega implementa solo tareas etiquetadas como `MVP` o `SOPORTE MVP`. No implementes ni marques tareas `POST-MVP` sin autorización posterior explícita que explique su valor para el usuario y su relación con el TFG. Toda tarea implementada necesita una breve nota de propósito, comentarios para decisiones no obvias y evidencia reproducible.
>
> Capacidades del MVP: cuenta/perfil/privacidad, rincones de libros y mapa, publicaciones ofrecidas/buscadas con datos bibliográficos mínimos, búsqueda/cercanía, mensajería privada, acuerdos de intercambio con lugar/horario/confirmación/recordatorio y notificaciones in-app básicas.

## 1. Línea base y controles de entrega

- [x] 1.1 Capturar commits locales/remotos, anomalías del árbol, metadatos de la PR #138, hilos sin resolver, estado de CI, versiones de esquema y auditoría de dependencias en una nota de recuperación; verificar que cada hallazgo tenga un comando o enlace reproducible.
- [x] 1.2 Exportar un backup local y restaurarlo en una base aislada; verificar cantidades de filas, historial de migraciones y disponibilidad de PostGIS sin eliminar el volumen original.
- [x] 1.3 Añadir checkpoints explícitos para runtime, PR #138, producto/seguridad y producción; verificar que indiquen que el agente prepara la PR y el usuario hace el merge.
- [x] 1.4 Normalizar la anomalía preexistente de saltos de línea/índice en un cambio aislado, o documentar por qué no hace falta reescribir archivos; verificar diff, hashes de blobs y estado limpio antes de tocar funcionalidades.

## 2. Entrega de la base de runtime

- [x] 2.1 Alinear `.nvmrc`, engines, CI y Dockerfiles en Node 22; verificar builds locales y de contenedor sin avisos `EBADENGINE`.
- [x] 2.2 Consolidar ejemplos de entorno de frontend/backend y eliminar nombres contradictorios; verificar que toda URL documentada use `/api` same-origin o incluya el prefijo `/api`.
- [x] 2.3 Configurar el proxy de Rsbuild para `/api` y `/socket.io`, manteniendo los mocks opt-in; verificar el backend por defecto y una ejecución mock aislada.
- [x] 2.4 Derivar REST y Socket.IO de un contrato común de configuración; verificar el modo local same-origin y un test cross-origin explícito.
- [x] 2.5 Implementar un preflight no destructivo de PostgreSQL/PostGIS que informe host, base, puerto, extensión y listener en conflicto; verificar que rechace el conflicto reproducido en Windows.
- [x] 2.6 Hacer idempotente la preparación de bases de desarrollo y test; verificar dos ejecuciones de migraciones en `entrelibros` y `entrelibros_test` sin repetir historial.
- [x] 2.7 Actualizar README y runbooks con instalación desde clon limpio, ciclo Docker/PostGIS, registro, credenciales locales y diferencia entre secretos JWT y contraseñas; verificar el recorrido hasta frontend, backend, Swagger y registro.
- [x] 2.8 Añadir regresiones de runtime y ejecutar typecheck, lint, stylelint, formato, tests y builds de backend/frontend; verificar todos los comandos requeridos.
- [x] 2.9 Hacer push de runtime y preparar su PR con evidencia, impacto de migraciones y rollback; verificar CI/revisión, avisar que el merge es manual y no hacerlo.
- [x] 2.10 Cuando el usuario confirme el merge de runtime, actualizar la rama desde main y repetir el smoke de clon limpio; verificar que no incluya funcionalidades de la PR #138.

## 3. Recuperación de la PR #138 y control de alcance

- [x] 3.1 Obtener head, base, checks, revisiones e hilos de la PR #138; verificar que cada hilo se relacione con un cambio y una regresión, o con una respuesta documentada.
- [x] 3.2 Actualizar la rama existente de #138 e integrar main preservando su historial; verificar que siga abierta contra main y sin archivos ajenos.
- [x] 3.3 Reproducir el estado obsoleto de confirmar/cancelar y añadir un test frontend que falle por esa causa.
- [x] 3.4 Inventariar mocks, transiciones locales y contratos backend faltantes del diff; incluir inicialización de conversaciones, versiones, confirmar, cancelar, reconectar y errores.
- [x] 3.5 Publicar el alcance final de #138 como prerrequisitos de mensajería y acuerdos versionados; mantener fuera entorno, dependencias generales y producción.

## 4. Mensajería privada persistente para la PR #138

- [x] 4.1 Añadir migraciones para conversaciones, participantes, mensajes, idempotencia/secuencia, lectura y metadatos de adjuntos; verificar esquemas vacío y actual, claves foráneas e índices.
- [x] 4.2 Implementar repositorios y servicios tipados para pertenencia, historial paginado, persistencia y lectura sin `any`; cubrir acceso no autorizado, orden y claves duplicadas.
- [x] 4.3 Añadir contratos REST autenticados para listar conversaciones, consultar historial, enviar mensajes y marcar lecturas; cubrir éxito, validación, 401, 403, paginación y claves i18n.
- [x] 4.4 Sustituir broadcasts globales de Socket.IO por salas autorizadas y persistencia antes de emitir; verificar que terceros no reciban mensaje ni metadatos.
- [x] 4.5 Añadir recuperación por cursor tras reconexión; verificar que se reciba exactamente el conjunto ordenado de mensajes faltantes.
- [x] 4.6 Incorporar interfaz de almacenamiento de adjuntos con implementación determinista de test y validaciones de tipo, tamaño y pertenencia; impedir payloads base64 en metadatos.
- [x] 4.7 Actualizar OpenAPI y claves i18n de mensajería; verificar que el contrato coincida con las respuestas reales.

## 5. Backend de acuerdos versionados para la PR #138

- [x] 5.1 Añadir migraciones para acuerdos, versiones/ítems inmutables, aceptaciones y eventos; impedir participantes inválidos, versiones duplicadas y referencias huérfanas.
- [x] 5.2 Implementar máquina de estados y autorización fuera de los handlers HTTP; cubrir cada transición permitida y prohibida.
- [x] 5.3 Implementar concurrencia optimista con versión esperada; verificar una transición confirmada y un conflicto con estado actual ante solicitudes simultáneas.
- [x] 5.4 Implementar propuestas y contrapropuestas como versiones completas inmutables; reconstruir historial y actor sin mutar filas previas.
- [x] 5.5 Implementar aceptación bilateral atómica y reserva de publicaciones; impedir doble reserva y revertir todos los cambios ante cualquier fallo.
- [x] 5.6 Implementar cancelación, rechazo y finalización con liberación de reservas y auditoría inmutable; registrar actor, momento, versión y motivo.
- [x] 5.7 Añadir endpoints autenticados de acuerdos vinculados a la pertenencia de la conversación; cubrir participantes, bloqueos, versiones obsoletas y publicaciones no disponibles.
- [x] 5.8 Emitir eventos versionados solo a salas autorizadas y después del commit; verificar un evento por transición confirmada y ninguno si hay rollback.
- [x] 5.9 Actualizar OpenAPI y contratos de errores i18n; documentar estados, conflictos y versiones esperadas.

## 6. Finalización del frontend de la PR #138

- [x] 6.1 Añadir clientes API tipados y claves TanStack Query para mensajes/acuerdos; cubrir serialización, paginación y conflictos sin `any`.
- [x] 6.2 Sustituir la inicialización de `mockConversations` por consultas autenticadas; conservar fixtures solo en tests/demo y verificar que producción no arranque mocks.
- [x] 6.3 Integrar eventos Socket.IO como invalidaciones/refetch y no como segunda fuente de verdad; cubrir reconexión y eventos duplicados.
- [x] 6.4 Hacer que confirmar/cancelar lea la versión vigente del servidor al ejecutarse; verificar la regresión de cierres obsoletos.
- [x] 6.5 Renderizar historial, aceptación bilateral, conflictos, motivos de cancelación y estados finales desde el servidor; cubrir participantes y estados terminales.
- [x] 6.6 Añadir estados de carga, vacío, reintento, autorización y recuperación de conflictos con mensajes traducidos; cubrir español y locale alternativo.
- [x] 6.7 Validar navegación por teclado, foco y etiquetas accesibles del compositor y diálogos; cubrir accesibilidad e interacción de teclado.
- [x] 6.8 Añadir E2E de dos usuarios para conversación, mensaje, contrapropuesta, conflicto obsoleto, aceptación bilateral, cancelación y reconexión contra PostGIS real con mocks desactivados.

## 7. Calidad de la PR #138 y puerta de merge manual

- [x] 7.1 Ejecutar migraciones desde base vacía, esquema preservado y backup anonimizado; verificar versión final idéntica y ausencia de pérdida de filas.
- [x] 7.2 Ejecutar typecheck, lint, stylelint, formato, tests, E2E y builds de producción; verificar los flujos tocados sin avisos React `act`, imágenes vacías ni Faker obsoleto. El E2E de servicio, CI y builds pasan; el control de navegador no estaba disponible y el E2E de navegador queda documentado como no disponible.
- [x] 7.3 Repetir auditoría de dependencias de producción para paquetes tocados por #138 y documentar excepciones; verificar que no aparezca una vulnerabilidad runtime alta/crítica no aprobada.
- [x] 7.4 Revisar el diff final contra el alcance publicado de #138 y retirar cambios ajenos; relacionar cada migración, endpoint, UI y dependencia con mensajería o acuerdos.
- [x] 7.5 Resolver o contestar cada hilo de revisión con evidencia, actualizar la descripción y pedir nueva revisión; verificar cero hilos accionables sin resolver.
- [x] 7.6 Hacer push de #138 y monitorizar CI hasta estado verde; verificar que sea integrable y avisar al usuario para el merge manual sin ejecutar ningún comando de merge.
- [x] 7.7 Cuando el usuario confirme el merge, actualizar main y repetir el smoke de mensajería/acuerdos; verificar el commit remoto antes de iniciar entregas dependientes. PR #138 verificada como mergeada en `9dd6e6b`; main local avanzó hasta `bcf1528` y el smoke aislado de 15 migraciones pasó.

## 8. Seguridad de plataforma y corrección de dependencias (MVP y POST-MVP)

- [x] 8.1 [SOPORTE MVP] Clasificar hallazgos de auditoría por ruta runtime y actualizar dependencias directas en grupos compatibles; verificar que no queden vulnerabilidades aplicables altas/críticas sin aprobar. Se actualizaron seis dependencias directas y parches transitivos; `npm audit --omit=dev` informa 0 vulnerabilidades y el backend aislado pasa 27 archivos/104 tests.
- [x] 8.2 [MVP] Proteger creación de rincones, verificación de libros y rutas mutables con autenticación y políticas de propietario/rol; cubrir 401/403 i18n y ausencia de cambios de datos. El backend aislado pasa 27 archivos/105 tests.
- [x] 8.3 [SOPORTE MVP] Añadir cookies, CORS y CSRF de producción con validación fail-closed; verificar same-origin y rechazo de mutaciones cross-origin o con token inválido. La configuración exige `FRONTEND_URL`, usa allowlist exacta y responde 403 localizado.
- [x] 8.5 [SOPORTE MVP] Añadir headers de seguridad, correlación de requests y redacción centralizada de secretos/PII; verificar correlación sin contraseñas, tokens, cookies ni ubicación privada exacta. El backend pasa 28 archivos/109 tests.
- [x] 8.7 [SOPORTE MVP] Actualizar OpenAPI, notas de amenazas y runbook de seguridad, y ejecutar comprobaciones; verificar que la entrega quede lista para revisión. OpenSpec, typecheck backend, 28/109 tests backend y 114/374 frontend pasan.
- [x] 8.8 [SOPORTE MVP] Preparar la PR de seguridad y esperar CI/revisión en verde; avisar al usuario cuando se requiera merge manual y no hacerlo. Los commits están aislados en `security/entrelibros-mvp-hardening`; las comprobaciones pasan localmente.

## 9. Finalización de identidad, perfil, reputación y catálogo (MVP y POST-MVP)

- [x] 9.1 [MVP] Añadir campos de perfil/privacidad y valores por defecto que no expongan ubicaciones precisas existentes; cubrir perfiles públicos/privados para usuarios antiguos y nuevos. Migración 016 y pruebas de perfiles públicos/privados completadas.
- [x] 9.2 [MVP] Implementar endpoints autenticados de perfil/preferencias y formularios de alias, descripción, idioma y granularidad de ubicación; verificar persistencia y cambio de locale E2E. API, formulario frontend y typechecks completados.
- [x] 9.3 [MVP] Añadir bloqueos y aplicarlos a conversaciones, acuerdos y notificaciones directas nuevas; cubrir ambas direcciones con errores que preserven privacidad. API de bloqueo/desbloqueo y rechazo bilateral de conversaciones/acuerdos completados.
- [x] 9.5 [MVP] Completar estados, transiciones, caducidad/renovación y reservas atómicas de publicaciones; cubrir caducidad programada e interacción con acuerdos. Se añadió caducidad de 30 días, renovación del propietario y transiciones explícitas; las reservas existentes siguen siendo transaccionales.
- [x] 9.6 [MVP] Añadir filtros paginados de texto, autor, ISBN, idioma, estado, distancia y tipo de intercambio; verificar planes, índices y filtros combinados. El catálogo ofrece filtros parametrizados, límite de 100, offset y radio PostGIS; el cliente frontend los serializa sin activar mocks.
- [x] 9.8 [MVP] Aplicar límites de cantidad/tipo/tamaño de imágenes y ubicaciones públicas redondeadas; cubrir medios inválidos y filtración de coordenadas exactas. Se validan hasta 6 imágenes, tipos raster permitidos, datos inline de hasta 5 MiB y coordenadas públicas redondeadas.
- [x] 9.9 [SOPORTE MVP] Actualizar frontend, OpenAPI y backlog para identidad/catálogo y ejecutar comprobaciones; verificar ausencia de errores backend crudos y mocks obsoletos. OpenAPI, backlog, typechecks, backend (27 archivos/108 tests) y frontend (114 archivos/374 tests) pasan; los mocks continúan siendo opt-in.
- [x] 9.10 [SOPORTE MVP] Preparar PRs por capacidad con CI/revisión en verde; avisar al usuario para cada merge manual y esperar confirmación antes de continuar. Esta rama queda lista para revisión y merge manual; no se ejecutó ningún merge.

## 10. Finalización de comunidad y mapa (MVP)

- [ ] 10.1 [MVP] Añadir propietario y estado de ciclo de vida básico a Rincones de Libros, con valores seguros para datos antiguos.
- [ ] 10.2 [MVP] Exigir autenticación para propuestas de Rincones de Libros e implementar la edición del propietario.
- [ ] 10.5 [MVP] Aplicar límites geográficos, privacidad y coordenadas públicas redondeadas en el mapa.
- [ ] 10.6 [MVP] Actualizar la interfaz comunitaria con mapa/listado coherentes y estados de carga, error y vacío.

## 11. Notificaciones in-app (MVP)

- [ ] 11.1 [MVP] Añadir persistencia mínima para notificaciones in-app y preferencias esenciales.
- [ ] 11.3 [MVP] Implementar notificaciones persistentes e idempotentes activadas por mensajes y acuerdos.
- [ ] 11.4 [MVP] Añadir un centro básico de notificaciones con estados traducidos y accesibles.

## 12. Validación final del MVP

- [ ] 12.1 [SOPORTE MVP] Ejecutar migraciones, typecheck, formato, tests y E2E de los flujos MVP; documentar cualquier excepción reproducible.

## 13. Trabajo futuro fuera de esta OpenSpec

Las funcionalidades no incluidas en las secciones anteriores quedan para una nueva OpenSpec posterior, sin agregar tareas de implementación aquí.
