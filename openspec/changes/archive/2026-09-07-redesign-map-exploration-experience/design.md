## Context

Ver `proposal.md` para la motivación y `specs/map-exploration-experience/spec.md`
para el contrato observable. Esta sección registra la investigación necesaria
para aplicar el cambio sin reinterpretar el producto.

### Estado actual investigado

- La ruta `/map` monta directamente `frontend/src/pages/map/MapPage.tsx` dentro
  de `BaseLayout`. La barra lateral global ya existe y no forma parte de este
  rediseño.
- `MapPage` concentra consulta, filtros, geolocalización, selección, detalle,
  edición, reporte y creación en una página de aproximadamente 863 líneas. Su
  composición actual es una grilla `286px minmax(0, 1fr) 300px`: rail normal,
  mapa y panel de detalle. El resumen `placeCard` vive dentro del mapa y el
  `CornerDetailsPanel` se agrega como tercera columna, por lo que el mismo
  Rincón puede aparecer en dos superficies.
- `MapCanvas` usa React Leaflet 5 y Leaflet 1.9.4. Dibuja un `TileLayer` OSM
  claro con un filtro CSS para oscurecerlo, `CircleMarker` para Rincones,
  publicaciones y actividad, un `divIcon` para la ubicación y controladores
  para bbox, recentrado y foco. No hay infraestructura de clustering instalada.
- `useMapData` consulta `GET /api/map` con bbox, centro opcional, texto, radio,
  temas, `openNow`, `recentActivity`, capas y locale. La API limita a 50
  Rincones, 100 publicaciones y 100 puntos de actividad, respeta coordenadas
  públicas aproximadas y filtra borradores/consentimiento/aprobación.
- El backend construye temas técnicos (`Comunidad`, alcance abierto o
  semiprivado y estado activo/en pausa). El mock usa categorías visuales del
  catálogo (`Cafés`, `Bibliotecas`, `Parques`, `Librerías`, `Más`). Además, la
  bandera `recentActivity` del backend controla la capa de puntos, no una
  ventana de frescura que permita afirmar “últimas 2 h”. Esa discrepancia debe
  resolverse en la implementación y en los textos.
- La respuesta de mapa tiene `lastSignalAt` en los Rincones, intensidad en los
  puntos de actividad y datos de publicaciones. El detalle público agrega
  horario, reglas, métricas semanales/totales y última actividad. No hay rating,
  reseñas, descripción rica ni una lista de eventos geolocalizados. El feed
  comunitario global devuelve usuario/avatar sin coordenadas y no es reutilizable
  como actividad cercana.
- La geocodificación existe en `api/map/geocoding.service.ts` y en el backend,
  pero el buscador de `MapPage` no la utiliza; hoy se consume por el formulario
  de ubicación de publicación.
- `MapHeader`, la raíz de `FilterRail` (aunque `RadiusSelector` sí se usa),
  `CreateCornerFab`, `ProposeMeetingModal` y los primitives de `map/common`
  tienen tests propios, pero no consumidores de producción en `/map` o en otra
  ruta según la búsqueda estática. Son variantes o scaffolds, no evidencia de un
  flujo activo. `CornerDetailsPanel`, `CornerEditModal`, `PublishCornerModal`,
  `ReportModal` y `useMapData` sí son parte del flujo real.
- La cobertura actual tiene pruebas unitarias de `MapPage` mock/real, `MapCanvas`,
  `FilterRail`, `MapHeader`, FAB, modal de propuesta y primitives, además de
  pruebas de API y rendimiento del mapa. No hay un spec Playwright dedicado a
  `/map` ni Storybook identificado.

### Lectura de `maps_prototipe.png`

La referencia muestra el shell existente con sidebar y un área de mapa casi a
pantalla completa. El panel izquierdo flota sobre el mapa y agrupa búsqueda,
distancia, categorías visuales y actividad. Los botones de filtros y ubicación
flotan arriba a la derecha; los pines tienen halos, estados y agrupación; la
selección es una tarjeta rica en el borde inferior/derecho. La sensación surge
de profundidad, transparencias, bordes suaves, sombras, mucho mapa visible y
una cartografía oscura subordinada a la identidad de la aplicación.

## Goals / Non-Goals

**Goals:**

- Conseguir una única composición map-dominant sobre el `BaseLayout` existente.
- Mantener una única fuente de verdad para selección, foco, filtros, bbox y
  ubicación, compatible con mock y API real.
- Usar datos públicos existentes sin rellenar la tarjeta con contenido ficticio.
- Hacer que el panel, los estados y la tarjeta funcionen con teclado, lector de
  pantalla, movimiento reducido y anchos intermedios.
- Reducir variantes sin consumidores que compitan con la nueva experiencia,
  solamente cuando la migración deje una eliminación inequívoca.

**Non-Goals:**

- Dividir o reescribir el modelo de mensajería, React Query, persistencia,
  acuerdos, contratos de libros o transacciones.
- Rediseñar el sidebar global, el flujo de alta/edición de Rincones o el reporte.
- Crear ratings, reseñas, inventarios, nuevos eventos, recomendaciones o datos
  de actividad no respaldados.
- Agregar un proveedor de mapas, clustering o una abstracción nueva sin una
  decisión de licencia, rendimiento y mantenimiento documentada.
- Convertir el cambio en una limpieza general del repositorio.

## Decisions

### 1. Composición de una sola superficie

El contenedor de `/map` se convertirá en un shell relativo que ocupe el alto
disponible del `main`, con `MapCanvas` expandido debajo de las capas. El título y
el contexto territorial se integrarán al panel flotante o a un encabezado mínimo
que no reduzca el área cartográfica. El panel de exploración tendrá ancho fijo
razonable en desktop, sombra y fondo semitransparente con tokens existentes; no
será una columna que obligue al mapa a compartir el ancho.

No se creará una segunda familia de controles. La raíz de `FilterRail` se
adaptará como panel de exploración único, incorporando búsqueda, categorías,
radio, disponibilidad/capas y actividad; `RadiusSelector` se conserva como
control accesible. `MapHeader` deja de ser necesario porque es una alternativa
sin consumidor productivo y sus responsabilidades quedan absorbidas por el
panel y los controles flotantes. `CreateCornerFab` se reutilizará como CTA
flotante si su posición puede hacerse relativa al shell; de lo contrario se
extraerá su texto/estilo a los controles del shell y se eliminarán componente y
test para no dejar dos caminos.

Los primitives `EmptyState`, `ErrorBanner`, `SkeletonList`, `Badge`,
`HeatLayerLegend` y `KeyValue` se pueden reutilizar para estados y metadatos
solo si encajan sin duplicar estilos. No se hará una limpieza independiente de
ellos en esta iniciativa.

### 2. Selección como estado único y tarjeta única

`selectedPin` será la fuente de verdad para Rincón o publicación. La tarjeta
flotante representará una unión discriminada de esos dos tipos y se actualizará
al cambiar de pin, al seleccionar desde la actividad o al consumir
`?corner=`. El foco y el `flyTo` seguirán siendo explícitos, para que mover el
mapa no robe foco ni recentre inesperadamente.

Se retirará el `placeCard` resumido actual como superficie independiente. El
detalle productivo de `CornerDetailsPanel` se extraerá o adaptará para que el
estado expandido del mismo contenedor sea la tarjeta/drawer de detalle; no se
mostrarán resumen y detalle equivalentes simultáneamente. Las acciones de dueño,
reporte, retry y actualización se conservan dentro del estado de Rincón y no se
agregan a una publicación.

La tarjeta solo renderizará campos que existan: imagen, nombre, tipo/estado,
zona aproximada, distancia si el centro existe, última señal o métricas luego de
cargar el detalle, reglas/horario cuando estén presentes y CTA de navegación.
Se eliminará el rating fijo `4,8` y cualquier texto que afirme actividad con una
precisión que el contrato no proporciona.

### 3. Filtros y categorías basados en el contrato real

El panel conservará `search`, radio, `openNow` y el control de actividad/capa,
pero cada etiqueta describirá su semántica real. La opción de categoría se
derivará de temas válidos del producto o de una fuente compartida; no se
enviarán al backend categorías del mock como `Bibliotecas` o `Poesía` si no
existen en su taxonomía. El modo mock deberá usar la misma taxonomía observable
que el real para que las pruebas no oculten diferencias.

El buscador seguirá filtrando nombres, zona y publicaciones según
`GET /api/map`. La conexión con sugerencias geocodificadas se hará solo si la
respuesta actual puede representar de forma segura una zona de exploración; al
seleccionar una sugerencia, sus coordenadas se usarán como centro/viewport y no
como ubicación exacta de un Rincón. Texto libre sin sugerencia seguirá siendo
búsqueda, no recenter.

La bandera `recentActivity` se presentará como “mostrar actividad” mientras el
backend solo controle la capa de puntos. Si se desea que filtre únicamente
Rincones activos por una ventana temporal, eso requerirá definir esa ventana y
extender el contrato; no se simulará con la etiqueta “últimas 2 h”.

### 4. Cartografía oscura y marcadores semánticos

`MapCanvas` conservará Leaflet/React Leaflet y sus controladores de bbox,
ubicación, selección y viewport. Se reemplazará el oscurecimiento global de una
tesela clara por una configuración explícita de URL/estilo oscuro y atribución.
La selección del proveedor será configurable y deberá respetar licencia,
atribución, límites de uso, caché y disponibilidad; Leaflet permite configurar
la plantilla y atribución del `TileLayer`, y la política de teselas estándar de
OSM impone condiciones que deben validarse antes de fijar producción.

Los pines pasarán a una representación `divIcon`/SVG o equivalente con
variables semánticas existentes: teal/orange/purple para estados de producto,
azul para ubicación y halos de actividad. La diferencia no dependerá solo de
color: tamaño, icono, borde, halo, tooltip y estado seleccionado también
participarán. Se mantendrá la coordenada pública aproximada y nunca se mostrará
la dirección privada.

No se instala clustering en la primera iteración. El límite server-side ya
protege el volumen; el render deberá priorizar selección, hit area y z-index de
forma determinista. Si una medición con dataset representativo demuestra que
eso no basta, la tarea de clustering queda aislada como decisión explícita,
con dependencia y pruebas propias, sin cambiar la consulta ni la privacidad.

### 5. Actividad sin inventar un feed

La primera versión del panel usará la actividad que ya puede verificarse:
`MapActivityPoint`, `lastSignalAt`, publicaciones vinculadas y, al abrir el
detalle, métricas semanales/totales. La lista podrá ordenar señales por
actividad/distancia disponible y llevar al elemento asociado, pero no llamará
“nuevo libro”, “evento” o “lector activo” a algo que el contrato no identifique.

No se usará `/api/community/activity` porque es global y no tiene coordenadas ni
tipo de acontecimiento. Un feed geolocalizado queda como extensión posterior o
como fase backend separada: requeriría una proyección `activityItems` con tipo,
identificador, fecha, referencia pública y bbox, basada en timestamps/métricas
existentes y con pruebas de privacidad. No requiere asumirse una tabla de
eventos ni inventarse una migración.

### 6. Responsive y accesibilidad

En desktop el panel izquierdo, controles superiores y tarjeta seleccionada
flotan dentro del shell. En tablet/intermedio el panel se vuelve colapsable o
drawer y la tarjeta pasa a una franja inferior/hoja que no cubre el control de
ubicación ni el mapa completo. Se probarán alturas, no solo anchos, porque la
superficie debe seguir siendo explorable.

Cada control tendrá nombre accesible, estado `aria-pressed` o equivalente,
foco visible, cierre por Escape cuando corresponda y live regions para carga,
error, truncamiento y ubicación denegada. Las animaciones de selección/fly-to
serán decorativas y respetarán `prefers-reduced-motion`.

### 7. Límites de API, privacidad y rendimiento

Se conservará `map-viewport-catalog` sin modificar: sin límite usa el bbox real,
los radios numéricos conservan centro/fallback, las publicaciones y actividad
siguen a los Rincones visibles, y se mantienen los límites y coordenadas
aproximadas. Las invalidaciones de creación/edición seguirán usando las claves
actuales.

La mejora visual debe conservar el baseline de rendimiento de
`backend/tests/routes/map.performance.test.ts` (p95 menor a 2 s en su carga
representativa) y no introducir solicitudes por pin. La consulta de detalle se
mantiene bajo demanda para el Rincón seleccionado.

### 8. Estrategia de pruebas

Se conservarán y ajustarán las pruebas existentes que protegen contratos reales,
y se retirarán únicamente las de componentes que efectivamente desaparezcan
(`MapHeader`, o FAB si no puede reutilizarse). Las nuevas pruebas se organizarán
en tres niveles:

1. Vitest/Testing Library para composición, filtro, búsqueda, categoría válida,
   estados, selección/cambio/cierre, acciones de ubicación/creación y responsive
   relevante mediante breakpoints.
2. `MapCanvas` para capas, pines semánticos, selección, ubicación, foco,
   viewport, estado oscuro, atribución y no regresión del bbox.
3. API/backend y Playwright real para navegación `/map`, selección de pin,
   búsqueda, radio, actividad, vacío, `Mi ubicación`, `Crear rincón`, recarga,
   persistencia/foco, responsive y no exposición de coordenadas exactas.

El flujo mínimo de verificación antes y después será `npm run verify:ci`, además
de la prueba manual con el dataset sintético y la checklist de navegador. Las
teselas externas no deben volver frágiles las pruebas: los tests unitarios las
mockearán y Playwright validará la superficie, controles, atribución y estados
sin depender de texto interno de un proveedor.

## Risks / Trade-offs

- **Proveedor de teselas sin SLA o con límites** → mantener URL/atribución
  configurable, documentar el proveedor aprobado, probar error de carga y
  conservar un fondo operable; no usar un endpoint público sin revisar sus
  condiciones.
- **La cartografía oscura puede perder contraste o etiquetas** → validar con
  contraste, zoom y ambos temas; ajustar capas propias y no oscurecer con un
  filtro que destruya legibilidad.
- **Categorías mock y reales divergentes** → definir una taxonomía observable
  común antes de cambiar el panel y agregar pruebas de paridad mock/real.
- **Actividad insuficiente para imitar la referencia** → comunicar señales
  agregadas y estado vacío; tratar el feed geolocalizado como contrato separado.
- **Selección sobre coordenadas aproximadas** → reutilizar siempre el pin público,
  no interpolar ni mostrar calle/altura, y revisar tarjeta, tooltip y tests E2E.
- **Muchos controles flotantes pueden tapar el mapa** → usar z-index y zonas
  reservadas, drawer responsive, focus management y pruebas con viewport/altura
  reales.
- **Cambiar/remover variantes con tests propios puede ocultar consumidores
  indirectos** → repetir `rg`/imports, rutas, scripts y build antes de borrar;
  dejar cualquier duda como follow-up y no eliminar `ProposeMeetingModal` ni
  primitives comunes sin evidencia adicional.
- **Leaflet mockeado no prueba el aspecto final** → sumar una comprobación
  Playwright y revisión manual; no presentar Vitest como prueba cartográfica real.

## Migration Plan

1. Registrar la captura de baseline actual con el dataset sintético y ejecutar
   suites de mapa, acuerdos/mensajería relacionados con navegación global y
   `npm run verify:ci` si el entorno lo permite.
2. Extraer/adaptar el shell visual, panel único, tarjeta de selección y
   controles; primero sin cambiar la consulta ni las acciones productivas.
3. Corregir paridad de categorías y textos/semántica de actividad; conectar
   geocodificación de zona solo si pasa la revisión de privacidad y contrato.
4. Cambiar cartografía/pines y validar atribución, error de teselas, tema claro y
   oscuro, foco, movimiento reducido y viewport.
5. Migrar o eliminar los componentes alternativos únicamente después de una
   búsqueda estática completa y de que los tests ya cubran sus responsabilidades
   reales.
6. Ejecutar tests unitarios, backend/API, Playwright de `/map`, revisión manual
   responsive y `npm run verify:ci`; actualizar `docs/tfg-browser-checklist.md`,
   `docs/estado-actual.md`, `docs/roadmap.md` y `docs/backlog.md` sin afirmar
   capacidades futuras como disponibles.

La reversión es de código y configuración: se puede volver al shell anterior y
al proveedor de teselas aprobado sin migración de base. Si se añadiera más
adelante un contrato de actividad, deberá desplegarse de forma compatible y
mantener un estado vacío cuando el campo no exista.

## Open Questions

- ¿Qué proveedor o estilo oscuro cuenta con aprobación de licencia, atribución,
  límites y disponibilidad para producción? La implementación puede resolverlo
  dentro del adaptador cartográfico antes de fijar la URL, sin cambiar el
  contrato funcional ni agregar credenciales al repositorio.
