# Rediseñar `/map` como experiencia de exploración

## Por qué

`/map` ya tiene una base funcional real —consulta por viewport, radio,
búsqueda, filtros, geolocalización, pines de Rincones/publicaciones y detalle—,
pero la composición actual todavía se percibe como una página de filtros que
contiene un mapa. La referencia visual
[`maps_prototipe.png`](<C:/REPOS/EntreLibros/Screens/Prototipo ideal/maps_prototipe.png>)
propone lo contrario: un mapa dominante, controles flotantes y una selección
que invita a explorar qué ocurre alrededor.

Este cambio propone acercar la experiencia a esa referencia sin inventar datos,
sin reemplazar las reglas actuales de descubrimiento y sin reescribir la
mensajería, los Rincones ni la persistencia.

## Qué cambia

- Reorganizar la página para que el mapa ocupe la superficie principal del área
  de contenido, con panel de exploración, controles y tarjeta de selección
  superpuestos de forma responsive.
- Reemplazar el aspecto de teselas claras teñidas por CSS por una cartografía
  oscura configurable, conservando atribución, accesibilidad y una alternativa
  operable si el proveedor de teselas falla.
- Rediseñar los pines de Rincones, publicaciones, actividad, selección y
  ubicación actual usando los tokens existentes de EntreLibros y semántica
  estable; evaluar clustering solamente si la densidad y el rendimiento reales
  lo justifican.
- Convertir el rail en un panel de exploración: búsqueda textual, radio,
  categorías reales, disponibilidad y actividad, con jerarquía visual y grupos
  colapsables en viewport reducido.
- Unificar la selección en una única tarjeta flotante. El detalle completo de un
  Rincón seguirá disponible desde esa tarjeta, pero no se mostrarán a la vez el
  popup, la tarjeta resumida y un panel duplicado.
- Mantener `Mi ubicación`, `Crear rincón`, selección desde URL, apertura de
  publicaciones, edición, pausa/reactivación y reporte, cambiando solamente su
  integración visual cuando sea necesario.
- Hacer explícitos los estados de carga, error, vacío, truncamiento, permiso de
  ubicación y búsqueda sin resultados, con foco de teclado y sin tapar el mapa.
- Mantener la actividad honesta: el contrato actual ofrece puntos agregados,
  `lastSignalAt` y métricas del detalle, pero no un feed geolocalizado de
  eventos. La propuesta no mostrará ratings, reseñas, horarios, descripción ni
  “nuevos eventos” si esos datos no existen. Una ampliación de actividad se
  tratará como contrato backend separado y verificable.

## Capacidades

### Nuevas capacidades

- `map-exploration-experience`: define la experiencia visual y de interacción de
  `/map`: composición dominante, cartografía y pines semánticos, panel de
  exploración, búsqueda/categorías, selección unificada, actividad basada en
  datos reales, acciones existentes y adaptación responsive.

### Capacidades modificadas

- Ninguna. Se conserva como restricción existente
  `openspec/specs/map-viewport-catalog/spec.md`: el modo sin límite sigue
  consultando el bbox visible, los radios numéricos siguen centrados en la
  ubicación disponible, se mantienen los límites de resultados y la privacidad
  de las coordenadas aproximadas.

## Impacto

- Frontend: `MapPage`, `MapPage.module.scss`, `MapCanvas`, sus estilos, el rail
  y los componentes alternativos `MapHeader`, `FilterRail` y
  `CreateCornerFab`; se reutilizarán `CornerDetailsPanel`, los modales de crear/
  editar/reporte, `useMapData`, los tokens de `_variables.scss` y los contratos
  actuales del mapa.
- Datos y lógica: no se cambia el contrato `GET /api/map` para la primera
  composición. Hay que corregir o decidir la discrepancia entre las categorías
  visuales del mock y los temas que el backend realmente devuelve. El buscador
  puede seguir filtrando texto; la selección de zona geocodificada es una mejora
  explícita porque el endpoint ya existe, aunque hoy no está conectado a
  `MapPage`.
- Backend: no se requiere migración para el rediseño visual. Si se quiere una
  lista de acontecimientos cercanos como la del prototipo, habrá que diseñar y
  probar una proyección geográfica de datos existentes (`created_at`,
  `last_activity_at`, publicaciones y métricas), sin reutilizar el feed global
  que no tiene ubicación y sin inventar eventos.
- Dependencias: no se agrega una librería de mapas ni de clustering por defecto;
  cualquier proveedor de teselas o dependencia adicional deberá justificarse
  por licencia, atribución, límites, rendimiento y mantenimiento.
- Tests y documentación: ampliar la cobertura de `MapPage` y `MapCanvas`, crear
  escenarios Playwright específicos de `/map`, conservar las pruebas de API y
  actualizar la checklist, estado/backlog y documentación operativa cuando la
  implementación se aplique.
