## Purpose

Convierte `/map` en una experiencia de exploración geográfica donde el mapa sea
el foco principal y los controles, actividad y selección acompañen la navegación
sin alterar las reglas reales de descubrimiento ni la privacidad territorial.

## ADDED Requirements

### Requirement: El mapa es el foco de la experiencia

La pantalla SHALL presentar el mapa como la superficie principal del área de
contenido. El título, la búsqueda, los filtros, las acciones y el contexto de la
selección SHALL integrarse visualmente como capas o paneles flotantes, sin
convertir el mapa en una columna secundaria ni reservar una columna permanente
para el detalle cuando no hay una selección abierta.

#### Scenario: Carga inicial con resultados

- **WHEN** una persona abre `/map` y la consulta devuelve resultados
- **THEN** la primera jerarquía visual es el mapa con sus pines
- **AND** la búsqueda, el acceso a filtros, `Mi ubicación` y `Crear rincón` son
  encontrables sin desplazar el mapa fuera de la superficie principal

#### Scenario: Carga, error o vacío

- **WHEN** el mapa está cargando, falla la consulta o no hay resultados
- **THEN** el mapa conserva una superficie útil y un estado superpuesto claro
- **AND** el estado no desplaza ni duplica controles fuera del contexto del mapa

### Requirement: La cartografía y los pines son coherentes con el tema

La superficie cartográfica SHALL ofrecer una variante oscura coherente con el
tema oscuro de EntreLibros, con calles y etiquetas secundarias subordinadas a
los elementos del producto. Los pines SHALL distinguir Rincones, publicaciones,
actividad, ubicación actual y selección mediante semántica visual consistente,
contraste suficiente y estados perceptibles sin depender únicamente del color.

#### Scenario: Tema oscuro

- **WHEN** el tema activo es oscuro
- **THEN** el fondo, las calles y las etiquetas del mapa no compiten con los
  paneles ni con los pines propios de EntreLibros
- **AND** la atribución cartográfica continúa visible

#### Scenario: Pin seleccionado y ubicación actual

- **WHEN** se selecciona un Rincón o se muestra la ubicación autorizada
- **THEN** el pin seleccionado tiene mayor protagonismo y foco visual que los
  demás
- **AND** la ubicación actual se distingue del contenido comunitario mediante
  un estado independiente y una etiqueta accesible

#### Scenario: Alta densidad de pines

- **WHEN** la cantidad de pines dificulta identificar ubicaciones individuales
- **THEN** la interfaz agrupa o prioriza visualmente los resultados de forma
  determinista
- **AND** cada resultado sigue pudiendo descubrirse al acercar, mover o cambiar
  filtros sin ocultar silenciosamente resultados elegibles

### Requirement: El panel permite explorar con datos reales

La interfaz SHALL ofrecer búsqueda textual, radio, categorías o temas realmente
disponibles, estado de disponibilidad y actividad reciente, con controles
agrupados por intención. La búsqueda textual SHALL continuar filtrando Rincones
o publicaciones; si se ofrece elección de zona, una sugerencia geocodificada
seleccionada SHALL recentrar la exploración y el texto no seleccionado SHALL no
inventar coordenadas.

#### Scenario: Búsqueda textual

- **WHEN** la persona escribe un barrio, Rincón, título o autor
- **THEN** la consulta y el listado muestran únicamente resultados que coinciden
  con el contrato de búsqueda vigente
- **AND** el mapa comunica carga o vacío sin perder el contexto de exploración

#### Scenario: Categoría o filtro no disponible

- **WHEN** no existe una categoría equivalente en los datos reales
- **THEN** la interfaz no muestra una categoría que produzca una consulta
  engañosa
- **AND** conserva una opción de exploración general y las categorías que sí
  tienen semántica definida

#### Scenario: Radio y viewport

- **WHEN** se cambia el radio o se mueve el mapa en modo sin límite
- **THEN** la consulta conserva las reglas actuales de centro, bbox, límites y
  orden
- **AND** el panel refleja qué contexto espacial está activo sin presentar una
  distancia inventada cuando no hay ubicación disponible

### Requirement: La selección usa una única tarjeta accionable

La experiencia SHALL mostrar una única tarjeta flotante para el elemento
seleccionado. La tarjeta SHALL priorizar información existente y útil —imagen,
nombre, tipo o estado, zona aproximada, distancia cuando exista, actividad,
horario o reglas cuando estén disponibles— y SHALL ofrecer una acción clara al
detalle. No SHALL mostrar a la vez una tarjeta resumida duplicada, un popup
equivalente y un panel lateral con la misma información.

#### Scenario: Seleccionar un Rincón

- **WHEN** la persona selecciona un Rincón desde un pin o desde el panel
- **THEN** el pin queda destacado y la tarjeta presenta su información pública
  disponible
- **AND** la acción de ver detalle abre el detalle completo sin duplicar el
  resumen en otra superficie persistente

#### Scenario: Cambiar o cerrar la selección

- **WHEN** la persona selecciona otro Rincón, una publicación o cierra la
  tarjeta
- **THEN** solamente queda activo el elemento correspondiente al último estado
- **AND** el foco, el encuadre y las acciones dejan de referirse al elemento
  anterior

#### Scenario: Datos no disponibles

- **WHEN** un campo como rating, reseñas, descripción o horario no existe para
  el elemento seleccionado
- **THEN** la tarjeta omite ese campo o informa su ausencia con una etiqueta
  neutra
- **AND** no muestra valores de ejemplo como si fueran datos del producto

### Requirement: La actividad cercana comunica únicamente señales verificables

La sección de actividad SHALL distinguir entre puntos agregados del mapa,
actividad de un Rincón y acontecimientos de publicaciones u otros eventos. Con
el contrato actual solo SHALL mostrar señales respaldadas por actividad,
`lastSignalAt`, publicaciones y métricas disponibles; no SHALL presentar el
feed global sin ubicación como actividad cercana. Una futura lista de eventos
geolocalizados SHALL requerir un contrato explícito con datos, alcance y reglas
de privacidad definidos.

#### Scenario: Hay actividad agregada

- **WHEN** la respuesta contiene puntos de actividad o un Rincón con actividad
  reciente verificable
- **THEN** el mapa y el panel representan esa señal con una etiqueta temporal o
  agregada honesta
- **AND** la selección conduce al Rincón o publicación correspondiente cuando
  existe un identificador

#### Scenario: No hay actividad cercana

- **WHEN** no hay señales de actividad para la zona y filtros activos
- **THEN** la interfaz comunica un estado vacío contextual
- **AND** no rellena la sección con todos los Rincones como si fueran eventos

### Requirement: Las acciones actuales permanecen disponibles

La pantalla SHALL conservar `Mi ubicación` y `Crear rincón`, respetando el
comportamiento existente de permisos, fallback territorial, autenticación y
apertura del flujo de publicación. También SHALL conservar la navegación a
publicaciones, edición, pausa/reactivación y reporte cuando correspondan al
usuario y al estado del Rincón.

#### Scenario: Mi ubicación

- **WHEN** una persona activa `Mi ubicación`
- **THEN** se solicita la ubicación solo según las reglas de autorización
  existentes, se actualiza el centro disponible y se conserva el radio elegido
- **AND** ante rechazo se muestra el fallback aproximado sin revelar una
  coordenada precisa

#### Scenario: Crear rincón

- **WHEN** una persona activa `Crear rincón`
- **THEN** se abre el flujo de publicación actual o el acceso autenticado que lo
  protege
- **AND** el mapa permanece disponible detrás del flujo cuando la modalidad lo
  permita

### Requirement: La exploración se adapta a resoluciones menores

La interfaz SHALL mantener una superficie de mapa utilizable en desktop,
tablet y resoluciones intermedias. El panel de exploración SHALL poder
colapsarse o abrirse como drawer, y la tarjeta de selección SHALL adaptarse sin
ocultar los controles del mapa, bloquear el contenido ni introducir scroll
horizontal.

#### Scenario: Tablet o ancho intermedio

- **WHEN** el área de contenido no permite mostrar panel y mapa lado a lado
- **THEN** el mapa conserva prioridad y el panel se puede abrir/cerrar desde un
  control accesible
- **AND** `Mi ubicación`, el estado de carga y la selección continúan siendo
  operables

#### Scenario: Teclado y movimiento reducido

- **WHEN** una persona navega con teclado o tiene activado movimiento reducido
- **THEN** los controles flotantes, pines seleccionables, paneles y tarjeta
  tienen foco visible, nombres accesibles y estados anunciables
- **AND** las transiciones de enfoque no dependen de animaciones imprescindibles
