## Purpose

Permitir explorar, filtrar y expresar interés por libros de forma persistente, con una interfaz de catálogo compacta y consistente con el prototipo ideal.

## ADDED Requirements

### Requirement: Filtros operativos del catálogo
El catálogo SHALL aplicar los filtros expuestos por su panel, incluyendo distancia cuando haya ubicación disponible, condición, disponibilidad, tipo de publicación y orden. Cada filtro SHALL actualizar los resultados, la paginación y un estado visible de filtros activos; el usuario SHALL poder restablecerlos.

#### Scenario: Aplicación de filtros combinados
- **WHEN** una persona selecciona condición y disponibilidad en el panel de filtros
- **THEN** la lista muestra solo publicaciones que cumplen ambas condiciones y vuelve a la primera página

#### Scenario: Filtro sin resultados
- **WHEN** una combinación de filtros no tiene coincidencias
- **THEN** el catálogo muestra un estado vacío con una acción para limpiar filtros y no conserva resultados que ya no cumplen el criterio

### Requirement: Navegación de pestañas sin desplazamiento vertical
La barra de pestañas de `/books` SHALL mostrar sus opciones en una única fila de altura estable, sin scrollbar vertical. En anchos reducidos SHALL permitir desplazamiento horizontal o reflow accesible sin recortar controles.

#### Scenario: Vista de escritorio
- **WHEN** `/books` se visualiza a 1440×900
- **THEN** las pestañas no generan scroll vertical y mantienen la jerarquía y densidad de `img.png`

### Requirement: Publicación de búsqueda de libro
Una persona autenticada SHALL poder crear una publicación de tipo `want` desde `/books`, ya sea desde la acción principal o desde un libro existente como punto de partida. El formulario SHALL identificarla como búsqueda y no exigir datos propios de una oferta, como precio o métodos de entrega no aplicables.

#### Scenario: Crear una búsqueda desde un libro visto
- **WHEN** una persona selecciona la acción de buscar un libro desde su detalle
- **THEN** se abre un formulario precompletado con la información bibliográfica disponible y al confirmarlo se publica una búsqueda propia

### Requirement: Interés personal sobre publicaciones
Una persona autenticada SHALL poder marcar y desmarcar una publicación ajena como favorita o de interés, y podrá expresar que busca ese título. Estas acciones SHALL ser idempotentes, visibles al volver a cargar el catálogo y no modificar la publicación original.

#### Scenario: Marcar favorito
- **WHEN** una persona marca una publicación como favorita
- **THEN** el control refleja el estado guardado y una recarga mantiene la selección

#### Scenario: Expresar búsqueda sin duplicados
- **WHEN** una persona activa buscar un título que ya tiene como búsqueda activa
- **THEN** el sistema informa que la búsqueda ya existe y no crea una publicación duplicada

