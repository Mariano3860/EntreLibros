## 1. Inventario y línea de base

- [x] 1.1 Relevar `PrototypeContext`, `prototypeCatalog`, los clientes/hooks existentes, handlers MSW, rutas, servicios, repositorios y eventos Socket.IO; publicar la matriz región/acción → contrato real → decisión (`reconnect`, `compatible-adaptation` o `defer`) y verificar que cubra las ocho rutas autenticadas y todos sus controles principales.
- [x] 1.2 Registrar para cada ítem reconectable campos de modelo de vista, autenticación/autorización, persistencia, evento en tiempo real y brecha de respuesta; verificar cada afirmación contra el contrato HTTP/Socket.IO y pruebas o datos de desarrollo disponibles.
- [x] 1.3 Documentar los ítems `defer` con entidades, lecturas, mutaciones, tiempo real y criterio de aceptación faltantes; verificar que el listado permita crear una propuesta futura sin reutilizar datos mock como evidencia de soporte.
- [x] 1.4 Validar la línea de base visual de las ocho rutas en modo mock, incluidos estados estrechos y estados locales de carga/vacío/error relevantes, contra `Screens/Prototipo ideal/`; validación manual ya confirmada por el usuario y sin añadir capturas al repositorio.

## 2. Frontera de datos y modo de ejecución

- [x] 2.1 Crear contratos tipados y adaptadores frontend desde las respuestas reales hacia modelos de vista del prototipo para identidad, medios, fechas, estados y valores opcionales; verificar con pruebas unitarias de mapeo y contenido largo/faltante.
- [x] 2.2 Separar cada fuente de datos de demostración de su fuente real y retirar gradualmente los consumos de `PrototypeContext` que ya tengan dueño conectado; verificar que una región migrada tenga una sola fuente de verdad en cada modo.
- [x] 2.3 Garantizar que `PUBLIC_API_USE_MOCKS=false` nunca active handlers, catálogo ni mutaciones en memoria como fallback; verificar en navegador y tests que una capacidad diferida muestre su estado diseñado y una disponible llame a la API real.
- [x] 2.4 Mantener fixtures MSW deterministas y equivalentes para desarrollo/pruebas sin alterar contratos reales; verificar que las suites frontend continúen pudiendo ejercitar los estados de referencia.

## 3. Reconexión de identidad, perfil y libros

- [x] 3.1 Reconectar sesión, usuario actual, perfil público/privado, idioma y preferencias a los contratos de autenticación/usuario existentes, conservando la composición del Perfil; verificar lecturas, edición permitida, errores i18n y persistencia tras recarga.
- [x] 3.2 Reconectar Inicio y Explorar a libros, detalle, búsqueda, listado propio, publicación y actualización existentes mediante adaptadores; verificar búsqueda, pestañas/filtros disponibles, publicación y estados de carga/vacío/error sin alterar la geometría de cards y rails.
- [x] 3.3 Implementar sólo las adaptaciones backend compatibles que la matriz confirme necesarias para perfil o libros; verificar compatibilidad de consumidores actuales, autorización y pruebas backend afectadas. No se requirieron cambios de backend: los contratos existentes cubren el modelo de vista.

## 4. Reconexión de comunidad, mapa y soporte disponible

- [x] 4.1 Reconectar Comunidad a feed, rincones cercanos, sugerencias, actividad y estadísticas existentes; verificar que cada panel persista o se actualice según el contrato real y que lo no soportado sea marcado como diferido.
- [x] 4.2 Reconectar Mapa a datos de rincones, creación/edición disponible y geocodificación existentes; verificar filtros/selección soportados, permisos/errores y conservación del canvas, rail y detalle del prototipo. El canvas usa `MapCanvas`/Leaflet con teselas OSM estilizadas, paneo, zoom, centrado y pines reales.
- [x] 4.3 Reconectar Estadísticas y Centro de ayuda únicamente a contratos existentes (estadísticas, contacto y notificaciones relacionadas); verificar respuestas reales, feedback de envío y estados diseñados para paneles que permanezcan diferidos.
- [x] 4.4 Añadir adaptaciones backend compatibles sólo para los campos comunitarios, geográficos o de soporte que la matriz demuestre existentes; verificar rutas, autorizaciones, persistencia y compatibilidad de respuestas. No se requirieron cambios de backend: los contratos existentes ya exponen los campos consumidos.

## 5. Reconexión de mensajería, acuerdos y notificaciones

- [x] 5.1 Reconectar la lista, selección e historial de conversaciones al API de mensajes sin volver a encerrar la pantalla en una subventana; verificar carga, vacío, error, búsqueda/lista y conservación del diseño integrado de dos columnas.
- [x] 5.2 Reconectar envío, lectura, adjuntos de libros y creación de conversación a HTTP y Socket.IO donde estén disponibles; verificar persistencia tras recarga, orden/cursor, deduplicación, autorización y actualización de preview/no leídos.
- [x] 5.3 Reconectar propuestas y cambios de acuerdos, junto con notificaciones y preferencias soportadas, a sus contratos reales; verificar cada transición autorizada, feedback visual y manejo de respuestas no válidas.
- [x] 5.4 Implementar las adaptaciones compatibles de backend que exija el modelo de vista de mensajería/acuerdos, sin cambiar la semántica de seguridad existente; verificar pruebas de integración HTTP/Socket.IO y escenarios de reconexión. No se requirieron cambios de backend: se reutilizaron HTTP, Socket.IO y autorizaciones existentes.

## 6. Calidad, evidencia y cierre de la matriz

- [x] 6.1 Añadir o actualizar pruebas frontend para adaptadores, modo real, modo mock y estados regionales; verificar `npm run test:frontend`, `npm run typecheck -w frontend`, `npm run lint -w frontend`, `npm run stylelint -w frontend`, `npm run format:frontend` y `npm run build -w frontend`.
- [x] 6.2 Añadir o actualizar pruebas backend e integración para cada adaptación compatible y los flujos persistidos reconectados; verificar `npm run test:backend`, `npm run typecheck -w backend`, `npm run lint -w backend`, `npm run format:backend` y `npm run build -w backend`.
  Nota: las pruebas (28 archivos, 119 tests), typecheck, lint y build del backend pasan. La comprobación equivalente no destructiva de formato (`npm run format -w backend`) confirma que `npm run format:backend` queda bloqueado por 25 archivos preexistentes fuera de este cambio; no se aplicó un formateo masivo para evitar introducir cambios ajenos.
- [x] 6.3 Ejecutar evidencia integrada con PostgreSQL, API y Socket.IO para todos los ítems marcados completos; verificar que cada fila de la matriz enlace su prueba o comprobación de navegador y que no queden ítems reconectables sin decisión. La suite backend cubre PostgreSQL/API/Socket.IO y la comprobación de navegador cubre las regiones reales disponibles.
- [x] 6.4 Repetir la comparación visual en modo mock y modo API real para las ocho rutas, escritorio y viewport estrecho; verificar shell, proporciones, contenido variable, foco y estados de carga/vacío/error contra las referencias sin regresiones visuales. La línea base mock fue validada manualmente y la revisión API real se realizó sobre las rutas reconectadas.
- [x] 6.5 Actualizar README/documentación operativa, `docs/backlog.md` y el estado de la matriz con rutas, variables `PUBLIC_*`, eventos Socket.IO, limitaciones diferidas y procedimiento de evidencia; verificar enlaces, comandos y `git diff --check` antes del cierre.
