## Why

La aplicación necesita dejar de interpretar las capturas como inspiración y tratarlas como el contrato visual del producto. Las dos láminas de `Screens/Prototipo ideal/` muestran ocho pantallas completas —Inicio, Explorar, Comunidad, Mensajes, Mapa, Estadísticas, Perfil y Centro de ayuda— con una composición, densidad, contenido, iconografía, color y jerarquía concretos. Una corrección estilística general puede producir una interfaz prolija pero diferente; este cambio busca una reconstrucción visual de alta fidelidad, verificable mediante capturas comparativas.

La primera etapa será frontend + MSW para poder recorrer y ajustar el prototipo sin esperar el diseño del backend definitivo. La coincidencia exacta de cada imagen dependerá de disponer de los mismos assets, fuentes y resolución, pero no se aceptará una implementación parcial que omita bloques visibles, reemplace gráficos por placeholders genéricos o deje acciones sin una respuesta demostrable.

## What Changes

- Adoptar los cuadrantes de `Screens/Prototipo ideal/img.png` y `img_1.png` como matriz de aceptación, excluyendo el chrome del navegador y comparando el viewport real de la aplicación.
- Reconstruir el shell autenticado con la misma anatomía en las ocho pantallas: logo EntreLibros, sidebar oscuro, orden y agrupación de navegación, acciones inferiores, perfil del usuario y selección teal.
- Reconstruir Inicio con hero editorial, bienvenida de Mariano, cuatro KPIs diferenciados, cinco recomendaciones visibles, navegación del rail de libros y panel de Actividad reciente.
- Reconstruir Explorar con toolbar completa, búsqueda, filtros, publicación, pestañas con `Todos` activa, cinco tarjetas de catálogo, badges, precios, acciones y paginación/navegación del rail.
- Reconstruir Comunidad con stories circulares, `Tu historia`, compositor social, publicación con media y acciones, Rincones cerca de vos con mini mapa y Sugerencias para vos.
- Reconstruir Mensajes con lista lateral, búsqueda, conversaciones y no leídos, header del chat, estados online, acciones, burbujas, propuesta de intercambio y composer inferior.
- Reconstruir Mapa con rail de filtros, búsqueda, chips, distancia, categorías, actividad local, mapa oscuro, clusters/pines, ubicación propia y detalle del Rincón seleccionado.
- Reconstruir Estadísticas con selector de período, exportación, cuatro KPIs, gráfico de intercambios, gráfico de publicaciones, ranking de Rincones, mapa de actividad y contribuyentes.
- Reconstruir Perfil con portada editorial, avatar, identidad pública, intereses, cuatro métricas, preferencias, objetivo anual, racha y logros.
- Reconstruir Centro de ayuda en `/contact` con hero, búsqueda, seis categorías, preguntas frecuentes y panel de chat/consulta.
- Crear un dataset mock único, estable y relacionado para que los mismos libros, usuarios, Rincones, mensajes y eventos conserven identidad entre pantallas.
- Crear o ampliar handlers MSW para lecturas y mutaciones de demo: historias, mensajes, adjuntos, propuestas, filtros de mapa, período estadístico, FAQs, edición de perfil y soporte.
- Mantener el modo oscuro como referencia canónica porque las láminas sólo muestran ese tema; el modo claro debe seguir siendo funcional, legible y accesible, pero no se inventará una segunda estética sin prototipo.
- Mantener las rutas frontend actuales y dejar fuera de este cambio endpoints reales, migraciones, tablas, repositorios, cambios de autenticación, Socket.IO y persistencia productiva. El contrato mock y sus gaps serán la entrada de una OpenSpec backend posterior.
- Aplicar una puerta de cierre por pantalla: cada cuadrante debe tener una captura comparativa revisada en desktop y una verificación de narrow viewport, estados de datos, teclado y reduced motion antes de dar por terminado el grupo.

## Capabilities

### New Capabilities

- `ideal-prototype-visual-language`: contrato compartido de shell, tokens, superficies, tipografía, iconografía, medios y estados visuales del prototipo.
- `ideal-prototype-screen-composition`: anatomía observable y reflow de las ocho pantallas, con los bloques y acciones concretos de cada cuadrante.
- `ideal-prototype-mock-experience`: datos, respuestas, mutaciones y estados MSW deterministas necesarios para recorrer el prototipo sin backend nuevo.

### Modified Capabilities

No hay capacidades principales existentes en `openspec/specs/`; las tres capacidades se mantienen como nuevas para este cambio.

## Impact

- Frontend React/Rsbuild: shell, rutas, componentes de página, tarjetas, feed, historias, mensajes, mapa, gráficos, perfil, ayuda, modales y estilos asociados.
- MSW: fixtures declarativos y handlers de catálogo, usuario, actividad, comunidad, mensajería, mapa, estadísticas y ayuda. Las respuestas deben ser repetibles y coherentes entre servicios.
- Assets: se hará inventario de portadas, avatares, fondos, iconos y recursos cartográficos. Se priorizarán los originales; si no existen, se usarán crops o fallbacks locales con la misma proporción, recorte, contraste y peso visual, dejando la sustitución registrada.
- Accesibilidad: foco visible, nombres para iconos, contraste, estados no dependientes sólo del color, teclado y `prefers-reduced-motion`.
- Verificación: tests frontend, typecheck, lint, Stylelint, formato, build y revisión visual manual de las ocho rutas. No se modificará backend, esquema, migraciones ni dependencias externas.
