## 1. Rail renovable de Inicio

- [x] 1.1 Crear `feature/home-recommendation-rail` desde `main` actualizado tras el merge de #159 y verificar que el worktree esté limpio y la rama tenga la base esperada.
- [x] 1.2 Extender la consulta de recomendaciones para devolver conjuntos estables de hasta cinco, con avance/retroceso o renovación y prioridad de perfiles seguidos; verificar con pruebas de repositorio/ruta que no devuelve propios, privados, bloqueados, vencidos ni más de cinco resultados.
- [x] 1.3 Implementar los controles compactos del rail en Inicio y mantener el detalle en modal; verificar con tests de `HomePage` navegación del rail, foco y ausencia de redirección.
- [x] 1.4 Revisar visualmente `/home` a 1440×900 y viewport estrecho contra el cuadrante superior izquierdo de `img.png`; verificar cinco cards, controles discretos, carga/vacío/error, teclado y reduced motion.
- [x] 1.5 Ejecutar suite backend/frontend afectada, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros, abrir PR en español contra `main` y verificar que no se realiza merge.

## 2. Filtros, búsquedas e interés en Libros

- [x] 2.1 Crear `feature/books-discovery-and-wants` desde `main` actualizado y verificar la base limpia antes de añadir migraciones acumulativas para intereses personales si el esquema las requiere.
- [x] 2.2 Implementar contratos persistentes para filtros de catálogo faltantes, favoritos/interés idempotentes y publicación `want` sin duplicados; verificar migraciones, autorización, bloqueos y pruebas de API para éxito, vacío, duplicado y acceso no autenticado.
- [x] 2.3 Conectar el panel de filtros, URL/paginación, favorito y el flujo “buscar este libro” en `/books`; verificar con tests de página/servicios que cada control modifica resultados y que el formulario `want` se precompleta sin pedir campos de oferta.
- [x] 2.4 Revisar visualmente `/books` a 1440×900 contra el cuadrante superior derecho de `img.png`; verificar filtros activos/restablecer, pestañas en una única fila sin scroll vertical, desplazamiento horizontal accesible en viewport estrecho, estado vacío, detalle y flujo de búsqueda.
- [x] 2.5 Ejecutar verificaciones del paquete afectado, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y abrir una PR en español contra `main` sin merge.

## 3. Foco y panel de detalle de Rincón en Mapa

- [x] 3.1 Crear `feature/map-corner-focus-panel` desde `main` actualizado y verificar que el contrato de rincón seleccionado pueda expresarse sin depender de una rama no mergeada.
- [x] 3.2 Implementar selección por `corner`, centrado/aproximación y panel superpuesto con imagen, horario, distancia, disponibilidad y fallback; verificar con pruebas de API/componente que un rincón válido enfoca el mapa y uno inaccesible muestra estado seguro.
- [x] 3.3 Conectar “Ver rincón” desde publicaciones, lista y pines al mismo estado de selección; verificar en tests de `MapPage`/`MapCanvas` que la interacción cambia viewport y detalle.
- [x] 3.4 Revisar visualmente `/map` a 1440×900 contra el cuadrante superior izquierdo de `img_1.png`; verificar foco del pin, panel derecho/inferior, imagen principal y comportamiento estrecho.
- [x] 3.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.

## 4. Radio geográfico real del Mapa

- [x] 4.1 Crear `feature/map-radius-filter` desde `main` actualizado después del merge del punto 5 y verificar que hereda el estado de selección de rincón.
- [x] 4.2 Extender el contrato geoespacial para radios 1, 5, 30, 50 y sin límite, aplicándolo a rincones, publicaciones y listados; verificar con pruebas de API que los resultados fuera de radio no se devuelven y que sin límite no filtra por distancia.
- [x] 4.3 Reemplazar el slider decorativo por una barra deslizante de posiciones discretas y renderizar el perímetro azul-celeste desde la ubicación aproximada; verificar con tests de `FilterRail`/`MapCanvas` que radio, círculo, rail y pines se actualizan juntos y que el fallback sin permiso no inventa precisión.
- [x] 4.4 Revisar visualmente `/map` a 1440×900 y narrow viewport contra `img_1.png`; verificar legibilidad de radios, perímetro, ubicación y lista limitada al rango.
- [x] 4.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.

## 5. Mini mapa real de Comunidad

- [x] 5.1 Crear `feature/community-mini-map-sync` desde `main` actualizado y verificar que puede consumir el estado URL acordado.
- [x] 5.2 Sustituir el fondo estático por una vista miniatura de rincones reales, con pines y selección; verificar con tests de servicio/componente que los datos provienen del contrato de rincones y manejan vacío/error.
- [x] 5.3 Navegar desde el mini mapa o la lista lateral a `/map` preservando rincón y radio; verificar con tests de `CommunityFeedPage` y `MapPage` que el destino queda centrado y abre el detalle correcto.
- [x] 5.4 Revisar visualmente `/community` a 1440×900 contra el cuadrante inferior izquierdo de `img.png`; verificar densidad del aside, pines visibles y CTA Ver mapa sin reemplazar el mapa completo.
- [x] 5.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.

## 6. Workflow completo de intercambio en Mensajes

- [x] 6.1 Crear `feature/messaging-exchange-workflow` desde `main` actualizado y relevar las burbujas, adjuntos y acuerdos existentes antes de modificar contratos; verificar que el diseño conserva cursor, client keys y autorización de participante.
- [x] 6.2 Completar persistencia/API para adjuntos tipados y lectura de libros propios/de contraparte cuando falte; verificar con pruebas de rutas, repositorio y Socket.IO que adjuntos/propuestas sobreviven recarga y rechazan participantes no autorizados.
- [x] 6.3 Recuperar el menú `+`, selector de libros, burbujas de texto/libro/acuerdo y propuesta de intercambio con ambos catálogos; verificar con tests de `Messages`, composer y modales que cada acción retorna al chat y no rompe el composer.
- [x] 6.4 Revisar visualmente `/messages` a 1440×900 contra el cuadrante inferior derecho de `img.png`; verificar dos columnas, scroll independiente, composer anclado, adjunto y propuesta visibles, además de teclado/narrow viewport.
- [x] 6.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.
- [x] 6.6 Incorporar un menú compacto del botón `+` con emoji, adjunto de libros propios/de contraparte e intercambio; verificar inserción del emoji en el borrador, apertura de modales, foco, teclado y viewport estrecho.
- [x] 6.7 Restringir las acciones de acuerdos según el autor de la propuesta: el autor solo puede cancelar y la contraparte puede aceptar o rechazar; verificar UI, API, versionado y estados pendientes.

## 7. Contactos y filtro de no leídos en Mensajes

- [x] 7.1 Continuar sobre `main` actualizado después del merge del workflow de intercambio y reutilizar su lista de conversaciones sincronizada; la política del repositorio mantiene el trabajo en la rama actual.
- [x] 7.2 Añadir búsqueda de personas por nombre/apellido/alias con seguidos primero y sugerencias después, aplicando visibilidad y bloqueos; verificar con pruebas de API los resultados ordenados, exclusión propia y accesos denegados.
- [x] 7.3 Reemplazar el selector por ID y hacer efectivo el filtro No leídos sobre conversaciones persistidas; verificar con tests de `MessagesPage` que busca por nombre, crea/abre conversación y alterna correctamente el filtro.
- [x] 7.4 Revisar visualmente `/messages` a 1440×900 y narrow viewport contra `img.png`; verificar selector legible, estado vacío de No leídos y foco del diálogo.
- [x] 7.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.

## 8. Edición y privacidad ampliada de Perfil

- [x] 8.1 Crear `feature/profile-privacy-editor` desde `main` actualizado y añadir una migración acumulativa para foto/ubicación estructurada/visibilidad solo si el esquema existente no cubre esos datos; verificar migración limpia y compatibilidad con perfiles existentes.
- [x] 8.2 Implementar la proyección pública por nivel geográfico y mantener calle privada; verificar con pruebas de perfil/API que `none`, país, ciudad y barrio no filtran datos superiores ni saltan bloqueos.
- [x] 8.3 Ampliar el formulario de `/profile` para foto, intereses y ubicación/visibilidad, con validación y fallback; verificar con tests de página que guardar, recargar, errores y permisos se comportan correctamente.
- [x] 8.4 Revisar visualmente `/profile` a 1440×900 contra el cuadrante inferior izquierdo de `img_1.png`; verificar que la edición cabe dentro del layout, conserva jerarquía y funciona en viewport estrecho.
- [x] 8.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.

## 9. Interacciones sociales e historias relevantes

- [ ] 9.1 Crear `feature/community-social-engagement` desde `main` actualizado tras el merge de #159 y revisar que el diseño de stories no vuelva a incluir al usuario autenticado en la tira.
- [ ] 9.2 Añadir migraciones y contratos para likes únicos, comentarios ordenados y permisos de feed, incluyendo bloqueos/visibilidad; verificar con pruebas de API alternancia idempotente, comentario válido/inválido y prohibición de acceso.
- [ ] 9.3 Implementar me gusta, comentarios, compartir con fallback y CTA separada para crear historia; verificar con tests de feed que el estado persiste, compartir confirma la acción y la tira excluye al usuario actual.
- [ ] 9.4 Revisar visualmente `/community` a 1440×900 y narrow viewport contra el cuadrante inferior izquierdo de `img.png`; verificar acciones accesibles, contador, hilo de comentarios, tira sin usuario propio y estados vacío/error.
- [ ] 9.5 Ejecutar suites afectadas, typecheck, lint, Stylelint, build y `git diff --check`; crear commits claros y una PR en español contra `main` sin merge.
