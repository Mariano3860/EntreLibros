_## 1. Matriz de referencia y recursos

- [x] 1.1 Recortar y catalogar los ocho cuadrantes de `Screens/Prototipo ideal/img.png` e `img_1.png`, separando chrome del navegador y definiendo el viewport de comparación de la aplicación en 1440×900; verificar que cada ruta tenga cuadrante, orden de bloques y evidencia de referencia.
- [x] 1.2 Medir en cada cuadrante la relación sidebar/main, gutters, gaps, alturas, columnas, densidad de tarjetas y regiones de scroll; verificar que la matriz contenga proporciones objetivo y no sólo nombres de componentes.
- [x] 1.3 Inventariar portadas, avatares, fondos, ilustraciones, iconos, mapa y recursos de gráficos; verificar para cada asset fuente original, URL estable o crop/fallback local, proporción, recorte, tratamiento y estado de sustitución.
- [x] 1.4 Registrar textos y valores visibles del mock —Mariano, Lucia, libros, KPIs, métricas de Perfil, categorías, actividades, rankings, FAQs y etiquetas de Mapa—; verificar que la matriz pueda alimentar las capturas sin texto genérico inesperado.

## 2. Sistema visual y shell

- [x] 2.1 Muestrear y congelar tokens de canvas, superficies, bordes, sombras, teal, acentos de KPIs/mapa, tipografía, tamaños, radios, controles y gaps a partir de las láminas; verificar dark mode contra un recorte de referencia y light mode sin controles ilegibles.
- [x] 2.2 Reconstruir el shell autenticado con logo, sidebar, orden de navegación, divisor, Ajustes, Ayuda, Cerrar sesión, perfil de Mariano y selección teal; verificar la misma geometría en las ocho rutas a 1440×900 y sin solapamiento.
- [x] 2.3 Implementar las primitivas compartidas de cards, hero, KPI, book card, avatar, chip, badge, botón, input, select, modal, panel, ranking y estado; verificar tamaños, wrap, focus-visible, hover, pressed, disabled, loading, empty, error y success.
- [x] 2.4 Aplicar la cadena de medios, overlays editoriales, fallback visual, iconos accesibles, transiciones y reduced motion; verificar que ningún media largo cubra texto/acciones y que icon-only controls tengan nombre accesible.

## 3. Contrato mock determinista

- [x] 3.1 Crear el catálogo declarativo compartido y sus tipos para Mariano, Lucia, Bot, libros, usuarios, historias, actividad, Rincones, conversaciones, mensajes, propuestas, mapas, métricas, series, rankings, perfil y FAQs; verificar IDs y relaciones cruzadas consistentes.
- [x] 3.2 Adaptar los handlers MSW de libros, usuario, actividad, comunidad, Rincones, sugerencias y mensajes para devolver el catálogo sin arrays fake privados en páginas; verificar dos cargas repetidas con respuestas y orden idénticos.
- [x] 3.3 Agregar handlers o adaptadores de demo para Estadísticas, gráficos, rankings, perfil extendido y Centro de ayuda sin crear endpoints backend; verificar que cada región visible de las láminas tenga datos tipados.
- [x] 3.4 Implementar mutaciones mock en memoria para historia social, mensajes, adjuntos, propuestas, filtros/categorías/distancia de mapa, selección de período, edición de perfil, FAQs y soporte; verificar que cada acción cambie la UI o muestre feedback explícito.
- [x] 3.5 Crear controles de fixture para loading, empty y error por región con retry/recovery; verificar que una falla local no borre shell ni regiones no afectadas y que los vacíos no muestren actividad ficticia.

## 4. Reconstrucción pantalla por pantalla

- [x] 4.1 Reconstruir Inicio con hero de reading room, saludo `¡Bienvenido de nuevo, Mariano!`, CTA, cuatro KPIs `134/52/1/1`, cinco recomendaciones nombradas, navegación del rail y Actividad reciente; verificar captura contra el cuadrante superior izquierdo de `img.png`.
- [x] 4.2 Reconstruir Explorar con título/subtítulo, búsqueda, Filtros, Publicar un libro, tabs con `Todos` activa, cinco cards de libros con metadata/badges/precio/acción y navegación del rail; verificar captura y acciones contra el cuadrante superior derecho de `img.png`.
- [x] 4.3 Reconstruir Comunidad con stories circulares, Tu historia, compositor con cinco acciones, post con media, Rincones cerca de vos con mini mapa y Sugerencias; verificar captura contra el cuadrante inferior izquierdo de `img.png` y que Publicar abra historia social.
- [x] 4.4 Reconstruir Mensajes con lista lateral, búsqueda, no leídos, header de Lucia, acciones, burbujas, propuesta de `Ecos del Viento Norte` y composer inferior; verificar captura contra el cuadrante inferior derecho de `img.png`, envío, adjunto y propuesta.
- [x] 4.5 Reconstruir Mapa con rail completo, chips, slider alrededor de 2 km, categorías, actividad, mapa oscuro, pines/clusters, ubicación propia y detalle de Café Literario; verificar captura contra el cuadrante superior izquierdo de `img_1.png` y filtros/ubicación/pin.
- [x] 4.6 Reconstruir Estadísticas con header, período, Exportar, KPIs `2.843/1.327/5.891/7.642`, línea semanal, barras de publicaciones, ranking, mapa de actividad y contribuyentes; verificar captura contra el cuadrante superior derecho de `img_1.png` y cambio de período.
- [x] 4.7 Reconstruir Perfil con portada, avatar, identidad pública, intereses, métricas `146/23/58/41`, Preferencias, Objetivo de lectura, racha y Logros; verificar captura contra el cuadrante inferior izquierdo de `img_1.png`, edición y contenido largo.
- [x] 4.8 Reconstruir Centro de ayuda en `/contact` con hero/ilustración, búsqueda, seis categorías, FAQs y panel de chat/consulta/email; verificar captura contra el cuadrante inferior derecho de `img_1.png`, búsqueda, FAQ y soporte.

## 5. Responsive, interacción y accesibilidad

- [x] 5.1 Implementar el reflow desktop/tablet/narrow preservando orden y acciones: sidebar colapsable, rails desplazables/apilados, chat lista→detalle, mapa rail→mapa, gráficos y ayuda apilados; verificar viewport estrecho sin overflow horizontal ni recortes.
- [x] 5.2 Verificar navegación por teclado, foco visible, labels de iconos, contraste oscuro/claro, controles nativos, `prefers-reduced-motion`, zoom y textos largos; verificar que los estados accesibles no alteren inesperadamente la geometría de las capturas.
- [x] 5.3 Agregar o actualizar tests de shell, Inicio, Explorar, Comunidad, Mensajes, Mapa, Estadísticas, Perfil, Ayuda, MSW y mutaciones; verificar tabs, filtros, publicación social, adjunto, propuesta, período, FAQs, errores y recuperación.

## 6. Puertas de aceptación y entrega

- [x] 6.1 Capturar Inicio/Explorar después de su implementación y comparar lado a lado con los recortes; verificar que no falte ningún bloque, dato, asset, acción, proporción o estado principal antes de continuar.
- [x] 6.2 Capturar Comunidad/Mensajes después de su implementación y comparar lado a lado con los recortes; verificar stories, composer, paneles, lista, chat, propuesta, composer y acciones reales del mock.
- [x] 6.3 Capturar Mapa/Estadísticas después de su implementación y comparar lado a lado con los recortes; verificar mapa oscuro, pines, rail, gráficos, rankings, métricas y controles sin placeholders genéricos.
- [x] 6.4 Capturar Perfil/Centro de ayuda después de su implementación y comparar lado a lado con los recortes; verificar hero, métricas, tarjetas inferiores, categorías, FAQs y soporte.
- [x] 6.5 Ejecutar `npm run test:frontend`, `npm run typecheck -w frontend`, `npm run lint -w frontend`, `npm run stylelint -w frontend`, `npm run format:frontend`, `npm run build -w frontend` y `git diff --check`; verificar que no haya cambios en backend, migraciones ni dependencias.
- [x] 6.6 Documentar el manifest de assets, contratos mock, estados controlables y gaps de API/persistencia para la futura OpenSpec backend; verificar que el backend pueda derivarse sin inspeccionar componentes visuales.
