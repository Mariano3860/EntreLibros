## Purpose

Garantizar que el descubrimiento y la gestión de libros presenten datos reales, navegación coherente y estados legibles para la persona usuaria, tanto en inicio como en el catálogo y el flujo de publicación.

## ADDED Requirements

### Requirement: Catálogo público completo

Las vistas de inicio y catálogo SHALL mostrar todas las publicaciones públicas y vigentes que correspondan a la consulta, incluyendo publicaciones de otros usuarios y no únicamente una muestra del usuario autenticado. La respuesta SHALL distinguir carga, vacío y error, y no SHALL presentar fixtures como datos reales en producción.

#### Scenario: Inicio con publicaciones de varios usuarios

- **WHEN** una persona autenticada abre el inicio y existen publicaciones públicas vigentes de varios usuarios
- **THEN** “Explorar libros” muestra resultados de esos usuarios según los límites y filtros aplicables

#### Scenario: Catálogo sin resultados

- **WHEN** la consulta no tiene publicaciones públicas vigentes
- **THEN** la interfaz muestra un estado vacío explícito y no una lista mockeada

### Requirement: “Todos” contiene la colección propia

La vista “Todos” SHALL ser la unión sin duplicados del catálogo público vigente y las publicaciones propias de la persona autenticada. Nunca SHALL incluir publicaciones privadas de otras personas. Por lo tanto, su cantidad SHALL ser igual o mayor que la de “Mis libros” para la misma sesión.

#### Scenario: Persona con publicación propia no pública

- **WHEN** la persona tiene una publicación propia que no aparece en el catálogo público
- **THEN** “Todos” la incluye para esa persona y “Mis libros” no supera en cantidad a “Todos”

### Requirement: Navegación unificada de todos los libros

El enlace “Ver todos” del inicio y del bloque de libros SHALL tener una acción observable y SHALL llevar al listado completo. `/books` SHALL ser la ruta canónica del listado completo, con la columna o pestaña “Todos” seleccionada al abrirse; los filtros y búsquedas activos SHALL conservarse cuando la navegación los incluya.

#### Scenario: Ver todos desde inicio

- **WHEN** una persona selecciona “Ver todos” en el inicio
- **THEN** navega al listado completo de `/books` y puede ver “Todos” como selección activa

#### Scenario: Ver todos desde catálogo

- **WHEN** una persona selecciona el acceso equivalente dentro de la vista de libros
- **THEN** el control responde y deja visible el listado completo sin un botón inerte

### Requirement: Libros propios y actividad verificables

La sección de libros propios SHALL cargar las publicaciones reales de la persona autenticada. Si se presenta como “Mi actividad”, SHALL incluir únicamente eventos derivados de acciones persistidas, como ofrecer un libro o concretar un intercambio, con estado vacío y error diferenciados. La interfaz SHALL evitar duplicar sin contexto el mismo acceso a “Mis libros”.

#### Scenario: Persona con dos libros propios

- **WHEN** la persona autenticada tiene dos publicaciones propias vigentes
- **THEN** la sección de libros propios muestra ambas desde la fuente real de datos

#### Scenario: Actividad de oferta e intercambio

- **WHEN** la persona autenticada ofreció un libro o participó en un intercambio persistido
- **THEN** “Mi actividad” muestra el evento correspondiente con su tipo y estado

### Requirement: Publicación legible en modo oscuro

El flujo de publicación SHALL mantener contraste suficiente y estados distinguibles para textos, campos, botones, mensajes de validación y controles en modo oscuro y claro.

#### Scenario: Publicar con tema oscuro

- **WHEN** una persona abre el flujo de publicación con el tema oscuro activo
- **THEN** todos los textos y controles necesarios para completar el flujo son legibles y distinguibles
