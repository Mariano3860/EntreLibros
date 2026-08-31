## Context

La propuesta y sus seis especificaciones cubren diez entregables de producto que hoy comparten datos, rutas y una referencia visual común. El frontend ya tiene componentes para mapa Leaflet, publicación `want`, conversaciones, adjuntos y acuerdos, pero varias superficies aún son locales o decorativas. El backend ya filtra publicaciones por texto/tipo/radio, persiste rincones, conversaciones, acuerdos, perfiles e historias; faltan contratos para favoritos/búsquedas personales, contactos sugeridos y reacciones/comentarios.

La referencia obligatoria es `Screens/Prototipo ideal/img.png` e `img_1.png`, complementada por `docs/prototype-ui-reference.md`. La composición de aceptación es 1440×900 sin chrome: cinco cards en rail de Inicio/Explorar, rail y detalle superpuesto en Mapa, y lista/chat de scroll independiente en Mensajes.

La PR abierta #159 (`feature/community-follow-suggestions`) aporta seguimiento, descubrimiento y `/api/books/home`. Debe entrar a `main` antes de crear ramas que dependan de lectores seguidos o historias personalizadas. Si no hubiera entrado, la PR dependiente deberá declarar explícitamente #159 como base/dependencia y no se abrirá contra `main` hasta resolverla.

## Goals / Non-Goals

**Goals:**

- Convertir cada control descrito en las especificaciones en una operación persistida, accesible y verificable con API real y MSW.
- Mantener las entregas aisladas: una rama, uno o más commits legibles, una PR en español y evidencia visual por punto.
- Reutilizar rutas, componentes y esquemas existentes cuando representen el comportamiento requerido; extender el modelo con migraciones acumulativas solo donde falte persistencia.
- Mantener privacidad por diseño: bloqueo/visibilidad aplican a descubrimiento, mapa, conversación, interés y feed; calle nunca es pública.

**Non-Goals:**

- No introducir un rediseño alternativo ni copiar imágenes raster del prototipo como interfaz funcional.
- No crear recomendaciones opacas: el orden social y la relevancia se limitarán a criterios explicables (seguimiento, disponibilidad, intereses y radio).
- No convertir esta fase en analítica, ranking global, chat grupal, pagos, seguimiento de lecturas o moderación completa.
- No combinar todas las entregas en una PR ni hacer merge automático.

## Decisions

### 1. Entregas independientes con orden de integración explícito

Cada punto tendrá una rama derivada de `main` actualizado y una PR separada. Para evitar que las ramas de Mapa o Mensajes copien cambios no mergeados, el orden de implementación/merge será: `#1`, `#2`, `#3`, `#5`, `#6`, `#4`, `#7`, `#9`, `#8`, `#10`. Las ramas `#4` dependen de la selección de rincón de `#5` y del contrato de radio de `#6`; `#9` depende del shell de acciones recuperado en `#7`.

Alternativa considerada: una sola rama/PR para las diez mejoras. Se descarta porque dificulta revisión, rollback y la corrección visual solicitada por punto.

### 2. Carrusel de Inicio basado en páginas estables de recomendaciones

`/api/books/home` evolucionará a una consulta con cursor o offset y un tamaño fijo máximo de cinco. El cliente mantendrá el conjunto visible y usará botones de flecha/puntos compactos del prototipo para pedir la página siguiente/anterior o renovar. El ranking sigue siendo determinista por solicitud: publicaciones seguidas elegibles primero y luego las públicas relevantes; los IDs vistos no se repiten hasta agotar el conjunto cuando el backend pueda garantizarlo.

Alternativa considerada: cargar todo el catálogo y rotar cards en memoria. Se descarta porque rompe relevancia, escala mal y no refleja cambios de disponibilidad.

### 3. Catálogo: filtros declarativos y estado personal separado de publicaciones

El panel de `/books` se reemplazará por controles que serializan un filtro único en URL/query: texto, tipo (`offer`/`want`), condición, disponibilidad, radio y orden. El backend reutilizará los filtros existentes y añadirá solo los campos faltantes. Paginación y tabs leerán la misma consulta, con `Todos` limitado al espacio deliberado del usuario y tabs de exploración para catálogo público según la política ya acordada.

El favorito/interés se almacenará en una relación `user_book_listing_interests` (usuario, publicación, creado en), no en la publicación. La acción “buscar este libro” creará o reutilizará una publicación propia `want` precompletada; una restricción lógica por usuario+referencia bibliográfica+estado activo evitará duplicados.

Alternativa considerada: usar el contador social de likes como favorito personal. Se descarta porque un favorito es privado, no cambia la señal pública y requiere lectura propia idempotente.

### 4. Estado de Mapa único, serializable y compartible

`MapPage` será dueña de un estado de vista compuesto por ubicación aproximada, radio discreto, filtros, `selectedCornerId` y bounds. El estado se reflejará en la URL cuando sea seguro (`corner`, `radius`, categorías), de modo que el mini mapa comunitario pueda navegar a la misma selección. El renderer dibujará un círculo Leaflet azul-celeste sobre la ubicación y ajustará bounds sin exponer calle ni coordenadas de perfil.

El backend aceptará `1`, `5`, `30`, `50` o ausencia de radio; la ausencia significa ilimitado. El mismo valor limita la consulta de rincones/publicaciones, el rail y los pines, evitando filtrado solo visual. “Ver rincón” usa `selectedCornerId` para hacer `flyTo` y abre un panel superpuesto de detalle alimentado por el rincón real.

Alternativa considerada: filtrar únicamente los pines en el navegador. Se descarta porque el listado y paginación podrían incluir resultados fuera de radio y porque descarga información innecesaria.

### 5. Mini mapa de Comunidad como vista derivada del contrato de Mapa

El mini mapa renderizará un subconjunto de `GET /community/corners/map` o del contrato de mapa normalizado, con su estado de selección local. No cargará una imagen de fondo como sustituto. Un click de pin/lista abrirá `/map?corner=<id>&radius=<valor>`; si el rincón no existe o no es visible, Mapa mostrará un estado no encontrado preservando los demás filtros.

Alternativa considerada: incrustar el mapa completo dentro de Comunidad. Se descarta para preservar la jerarquía de `img.png` y el rendimiento de la columna lateral.

### 6. Mensajería: tipos de mensaje preservados y selector de personas legible

Las burbujas siguen usando el historial cronológico existente, con `attachment_metadata` tipado para libro y propuesta. Se completará el contrato para leer y renderizar libros propios y de contraparte y se reutilizarán acuerdos para propuestas, sin inventar una segunda fuente de verdad. El menú `+` expone acciones en un popover/floating sheet con foco gestionado; cada acción abre el selector correspondiente y retorna al composer.

La nueva conversación tendrá un endpoint de búsqueda de personas que acepta nombre visible/alias, devuelve seguidos antes que sugerencias y aplica visibilidad/bloqueos. El filtro de no leídos será local sobre la lista sincronizada, respaldado por el contador/secuencia persistidos, no una etiqueta estática.

Alternativa considerada: mantener el campo de ID y resolver nombres solo en cliente. Se descarta porque no escala, filtra mal identidades privadas y no cubre sugerencias.

### 7. Perfil con modelo de ubicación privado y proyección pública

El perfil guardará país, ciudad, barrio y calle opcional junto con un enum de máxima visibilidad pública (`none`, `country`, `city`, `neighborhood`). Las respuestas públicas construirán una proyección según el enum; la calle no cruzará la API pública. La foto se manejará con la política existente de cargas/fallbacks y validación de tipo/tamaño, sin exponer rutas de almacenamiento no autorizadas.

Alternativa considerada: una sola cadena de texto de ubicación. Se descarta porque no permite validación, filtrado geográfico ni control granular de visibilidad.

### 8. Interacciones comunitarias con relaciones idempotentes

Los likes se modelarán por usuario/publicación con unicidad. Comentarios tendrán autor, cuerpo validado, fecha, visibilidad y orden estable. Compartir no necesita una relación social obligatoria: produce una URL canónica y una telemetría opcional no bloqueante; el fallback copia al portapapeles. Feed y stories aplicarán el mismo filtro de bloqueos/visibilidad. La creación de historia se moverá a una CTA separada para que la tira muestre únicamente contenido de otras personas elegibles.

Alternativa considerada: conservar likes y comentarios solamente en estado React. Se descarta porque desaparecen al recargar y contradicen el requisito de interacción real.

### 9. Protocolo visual y de calidad por PR

Cada rama deberá: (a) activar datos reales o mocks representativos, (b) probar el flujo en navegador a 1440×900 y en viewport estrecho, (c) capturar evidencia antes/después o documentar el recorrido contra el cuadrante correspondiente, (d) inspeccionar foco, teclado, carga, vacío, error y reduced motion, (e) añadir tests frontend/backend que cubran caminos nuevos y negativos, y (f) ejecutar la suite del paquete afectado, typecheck, lint, Stylelint si aplica, build y `git diff --check`.

La descripción de cada PR será en español e incluirá alcance, decisiones visuales, pruebas ejecutadas, migraciones/endpoints y pasos manuales. El agente no hará merge; el usuario decide el orden y resuelve conflictos.

## Risks / Trade-offs

- [Ramas que dependen de #159 o de entregas previas] → Crear desde `main` actualizado tras cada merge y declarar blockers en las tareas/PR.
- [Cambios de esquema para intereses, perfiles y Comunidad] → Una migración acumulativa por rama, pruebas de migración y rollback mediante código compatible; nunca editar migraciones aplicadas.
- [Ubicación sensible] → Usar precisión aproximada y proyección por visibilidad; probar respuestas públicas y bloqueos.
- [Rangos de 30/50 km más costosos] → Aplicar filtro geoespacial en base de datos, límite de resultados y/o paginación; medir consulta antes de abrir la PR.
- [Diferencia visual por datos variables o teselas de mapa] → Usar viewport, datos semilla y fallback local reproducibles; comparar estructura y jerarquía, no píxeles de teselas externas.
- [Recuperar burbujas puede reintroducir estados duplicados] → Mantener IDs/client keys, cursor y estado de acuerdo como fuentes de sincronización; cubrir reconexión e idempotencia.
- [Comentarios y likes abusivos] → Validar longitud, autorización, bloqueos y dejar explícito que moderación/reportes completos no pertenecen a este cambio.

## Migration Plan

1. Merge previo de #159 y actualización local de `main`.
2. Implementar y revisar las diez ramas en el orden definido, aplicando cada migración antes de ejecutar pruebas de API y datos demo.
3. Publicar una PR por rama con migraciones, contratos y evidencia visual; el usuario realiza cada merge.
4. Tras cada merge, ejecutar migraciones en el entorno objetivo y una prueba de humo de la ruta afectada; si aparece una regresión, revertir el commit/PR de esa única entrega y conservar las migraciones como acumulativas mediante una migración correctiva.

## Open Questions

- El copy y la ubicación final del CTA separado para crear historia se resolverán durante la revisión visual, siempre que no vuelva a insertar al usuario autenticado dentro de la tira de stories.
- La señal de relevancia secundaria de Inicio puede priorizar intereses declarados o coincidencia bibliográfica cuando no haya publicaciones seguidas; ambas opciones respetan la especificación mientras sean explicables y no oculten publicaciones elegibles.
